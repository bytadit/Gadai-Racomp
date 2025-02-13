'use client';
import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Fuse from 'fuse.js';
import { Combobox } from '@/components/ui/combo-box';
import { RefreshCw, SquarePen } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { SpokeSpinner } from '@/components/ui/spinner';
import { formatCurrency, formatDate, parseCurrency } from '@/lib/utils';
import { DateTimePicker } from '@/components/date-time-picker';
import { Toggle } from '@/components/ui/toggle';
import { calculateSisaTanggungan } from '@/lib/transaction-helper';
type Customer = {
    id: number;
    name: string;
    nik: string;
};

type Item = {
    id: number;
    name: string;
    serial: string;
    customerId: number;
};
type Transaction = {
    id: number;
    status_transaksi: string;
    type: string;
    waktu_pinjam: string;
    itemId: number;
    tanggungan_awal: any;
    tgl_jatuh_tempo: string;
    persen_tanggungan: any;
    nilai_pinjaman: any;
    tanggungan_akhir: any;
};

type Cashflow = {
    termin: number;
    amount: any;
    transactionId: number;
};
export default function CashflowForm() {
    const [initialTanggungan, setInitialTanggungan] = useState<number>(0);
    const cashflowSchema = z.object({
        termin: z.number().min(1, {
            message: 'Termin tidak boleh kosong!',
        }),
        payment_type: z.enum(['BNI', 'BSI', 'CASH'], {
            required_error: 'Pilih tipe pembayaran!',
        }),
        amount: z.coerce
            .number()
            .min(50_000, { message: 'Nilai pembayaran minimal 50 ribu' })
            .max(1_000_000_000_000_000, {
                message: 'Nilai pembayaran tidak boleh melebih 1 trilyun!',
            }),
        tanggungan: z.coerce
            .number()
            .min(0, { message: 'Sisa tanggungan tidak boleh negatif' })
            .max(1_000_000_000_000_000, {
                message: 'Sisa tanggungan tidak boleh melebih 1 trilyun!',
            })
            .refine(
                (val) => val <= initialTanggungan,
                `Nilai pembayaran tidak boleh melebihi ${formatCurrency(initialTanggungan)}`,
            ),
        waktu_bayar: z.preprocess(
            (arg) => {
                if (typeof arg === 'string' || arg instanceof Date) {
                    return new Date(arg);
                }
                return arg;
            },
            z.date({
                required_error: 'Masukkan waktu pembayaran!',
            }),
        ),
        desc: z.string().optional(),
    });

    const form = useForm<z.infer<typeof cashflowSchema>>({
        resolver: zodResolver(cashflowSchema),
        defaultValues: {
            termin: 1,
            payment_type: 'CASH',
            amount: 0,
            tanggungan: 0,
            waktu_bayar: new Date(),
            desc: '',
        },
        mode: 'onBlur',
        shouldFocusError: true,
    });

    const router = useRouter();
    const [isPending, setIsPending] = React.useState(false);
    // const [latestCashflow, setLatestCashflow] = useState<Cashflow | null>(null);
    const [customersData, setCustomersData] = useState<Customer[]>([]);
    const [itemsData, setItemsData] = useState<Item[]>([]);
    const [transactionsData, setTransactionsData] = useState<Transaction[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
        null,
    );
    const [selectedItem, setSelectedItem] = useState<Item | null>(null);
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);
    const [customerQuery, setCustomerQuery] = useState('');
    const [itemQuery, setItemQuery] = useState('');
    const [transactionQuery, setTransactionQuery] = useState('');
    const [isOverride, setIsOverride] = useState<boolean>(false);
    const [waktuBayarNow, setWaktuBayarNow] = React.useState<boolean>(true);

    const isFormDisabled = !selectedTransaction;

    // Fetch initial customers
    useEffect(() => {
        fetch('/api/customers')
            .then((res) => res.json())
            .then(setCustomersData);
    }, []);

    // Fetch items when customer changes
    useEffect(() => {
        if (selectedCustomer) {
            fetch(`/api/items?storedCustomerId=${selectedCustomer.id}`)
                .then((res) => res.json())
                .then(setItemsData);
        } else {
            setItemsData([]);
            setSelectedItem(null);
        }
    }, [selectedCustomer]);

    // Fetch transactions when item changes
    useEffect(() => {
        if (selectedItem) {
            fetch(
                `/api/transactions?storedItemId=${selectedItem.id}&status=active`,
            )
                .then((res) => res.json())
                .then(setTransactionsData);
        } else {
            setTransactionsData([]);
            setSelectedTransaction(null);
        }
    }, [selectedItem]);

    // Fuse.js search configurations
    const customerFuse = useMemo(
        () => new Fuse(customersData, { keys: ['name', 'nik'] }),
        [customersData],
    );

    const itemFuse = useMemo(
        () => new Fuse(itemsData, { keys: ['name', 'serial'] }),
        [itemsData],
    );

    const transactionFuse = useMemo(
        () => new Fuse(transactionsData, { keys: ['type'] }),
        [transactionsData],
    );

    const filteredCustomers = useMemo(() => {
        return customerQuery
            ? customerFuse.search(customerQuery).map((result) => result.item)
            : customersData;
    }, [customerQuery, customerFuse, customersData]);

    const filteredItems = useMemo(() => {
        return itemQuery
            ? itemFuse.search(itemQuery).map((result) => result.item)
            : itemsData;
    }, [itemQuery, itemFuse, itemsData]);

    const filteredTransactions = useMemo(() => {
        return transactionQuery
            ? transactionFuse
                  .search(transactionQuery)
                  .map((result) => result.item)
            : transactionsData;
    }, [transactionQuery, transactionFuse, transactionsData]);

    // Handlers
    const handleCustomerSelect = (customer: Customer) => {
        setSelectedCustomer(customer);
        setSelectedItem(null);
        setSelectedTransaction(null);
        form.reset({
            termin: 1,
            payment_type: 'CASH',
            amount: 0,
            tanggungan: 0,
            waktu_bayar: new Date(),
            desc: '',
        });
    };

    const handleItemSelect = (item: Item) => {
        setSelectedItem(item);
        setSelectedTransaction(null);
    };

    const handleTransactionSelect = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
    };

    // Form calculations
    useEffect(() => {
        if (!isOverride) {
            const amount = form.watch('amount');
            const newTanggungan = initialTanggungan - amount;
            form.setValue('tanggungan', newTanggungan);
        }
    }, [form.watch('amount'), initialTanggungan, isOverride, form]);

    useEffect(() => {
        if (selectedTransaction) {
            fetch(
                `/api/cashflows?storedTransactionId=${selectedTransaction.id}`,
            )
                .then((res) => res.json())
                .then((data: Cashflow[]) => {
                    if (data.length > 0) {
                        const latest = data.reduce(
                            (max, item) =>
                                item.termin > max.termin ? item : max,
                            data[0],
                        );
                        form.setValue('termin', latest.termin + 1);

                        // Now calculate sisaTanggungan using the state variable.
                        const sisaTanggungan = calculateSisaTanggungan({
                            transaction: {
                                id: selectedTransaction.id,
                                tanggungan_awal:
                                    selectedTransaction.tanggungan_awal,
                                tgl_jatuh_tempo:
                                    selectedTransaction.tgl_jatuh_tempo,
                                persen_tanggungan:
                                    selectedTransaction.persen_tanggungan,
                                nilai_pinjaman:
                                    selectedTransaction.nilai_pinjaman,
                            },
                            cashflows: data, // Using the state variable which holds the fetched cashflows.
                        });

                        setInitialTanggungan(sisaTanggungan);
                    } else {
                        setInitialTanggungan(
                            selectedTransaction.tanggungan_akhir,
                        );
                        form.setValue('termin', 1);
                    }
                });
        }
    }, [selectedTransaction, form]);

    // Date handling
    useEffect(() => {
        if (waktuBayarNow) {
            form.setValue('waktu_bayar', new Date());
        }
    }, [waktuBayarNow, form]);

    // Submit handler
    const onSubmit = async (values: z.infer<typeof cashflowSchema>) => {
        setIsPending(true);
        try {
            const response = await fetch('/api/cashflows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    transactionId: selectedTransaction?.id,
                }),
            });

            if (!response.ok) throw new Error('Failed to save');
            // If remaining debt is 0, update transaction and item status
            if (values.tanggungan === 0 && selectedTransaction) {
                // Update transaction status
                await fetch(`/api/transactions/${selectedTransaction.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status_transaksi: 'SELESAI' }),
                });

                // // Update item status
                // await fetch(`/api/items/${selectedTransaction.itemId}`, {
                //     method: 'PUT',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ status: 'KELUAR' }),
                // });
            }

            const { cashflow } = await response.json();
            router.push(`/dashboard/cashflow/${cashflow.id}`);
            toast.success('Data cashflow berhasil dibuat!');

            // Reset form after successful submission
            form.reset();
            setSelectedCustomer(null);
            setSelectedItem(null);
            setSelectedTransaction(null);
        } catch (error: any) {
            console.log(error.message);
            toast.error('Gagal menyimpan data!');
        } finally {
            setIsPending(false);
        }
    };
    return (
        <>
            <Card className="mx-auto w-full mb-4">
                <CardHeader>
                    <CardTitle className="text-left text-2xl font-bold">
                        Setting Data
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Combobox<Customer>
                        items={filteredCustomers}
                        value={selectedCustomer}
                        label="Pilih pelanggan"
                        onSearch={setCustomerQuery}
                        onSelect={handleCustomerSelect}
                        placeholder="Pilih pelanggan..."
                        displayValue={(customer) =>
                            customer ? `${customer.nik} | ${customer.name}` : ''
                        }
                        disabled={false}
                    />
                    <Combobox<Item>
                        items={filteredItems}
                        value={selectedItem}
                        label="Pilih barang"
                        onSearch={setItemQuery}
                        onSelect={handleItemSelect}
                        placeholder="Pilih barang..."
                        displayValue={(item) =>
                            item ? `${item.serial} | ${item.name} ` : ''
                        }
                        disabled={!selectedCustomer}
                    />
                    <Combobox<Transaction>
                        items={filteredTransactions}
                        value={selectedTransaction}
                        label="Pilih transaksi"
                        onSearch={setTransactionQuery}
                        onSelect={handleTransactionSelect}
                        placeholder="Pilih transaksi..."
                        displayValue={(transaction) =>
                            transaction
                                ? `${formatDate(transaction.waktu_pinjam)} - ${transaction.status_transaksi}`
                                : ''
                        }
                        disabled={!selectedItem}
                    />
                </CardContent>
            </Card>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card className="mx-auto w-full">
                        <CardHeader>
                            <CardTitle className="text-left text-2xl font-bold">
                                Data Cashflow Baru
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
                                {/* Termin Pembayaran */}
                                <FormField
                                    control={form.control}
                                    name="termin"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>
                                                Termin Pembayaran
                                            </FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    disabled={isFormDisabled}
                                                    min={1}
                                                    readOnly={true}
                                                    value={field.value}
                                                    onChange={(e) =>
                                                        field.onChange(
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="payment_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Tipe Pembayaran
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                disabled={isFormDisabled}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="BNI">
                                                        BNI
                                                    </SelectItem>
                                                    <SelectItem value="BSI">
                                                        BSI
                                                    </SelectItem>
                                                    <SelectItem value="CASH">
                                                        Cash
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Nilai Pembayaran */}
                                <FormField
                                    control={form.control}
                                    name="amount"
                                    render={({ field }) => {
                                        const rawValue = form.watch('amount');

                                        return (
                                            <FormItem className="space-y-2">
                                                <FormLabel>
                                                    Nilai Pembayaran
                                                </FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                            Rp.
                                                        </span>
                                                        <Input
                                                            type="text"
                                                            className="pl-10"
                                                            disabled={
                                                                isFormDisabled
                                                            }
                                                            value={formatCurrency(
                                                                rawValue,
                                                            )}
                                                            onChange={(e) => {
                                                                // Parse and clamp the value
                                                                const parsed =
                                                                    parseCurrency(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                const maxAllowed =
                                                                    initialTanggungan;
                                                                const clampedValue =
                                                                    Math.min(
                                                                        parsed,
                                                                        maxAllowed,
                                                                    );

                                                                form.setValue(
                                                                    'amount',
                                                                    clampedValue,
                                                                    {
                                                                        shouldValidate:
                                                                            true,
                                                                    },
                                                                );
                                                            }}
                                                            onBlur={() =>
                                                                form.trigger(
                                                                    'amount',
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        );
                                    }}
                                />

                                <FormField
                                    control={form.control}
                                    name="tanggungan"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>
                                                Sisa Tanggungan
                                            </FormLabel>
                                            <div className="flex items-center gap-1">
                                                <FormControl>
                                                    <div className="relative w-full">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                            Rp.
                                                        </span>
                                                        <Input
                                                            type="text"
                                                            disabled={
                                                                isFormDisabled
                                                            }
                                                            className={`pl-10 ${!isOverride ? 'text-muted-foreground' : ''}`}
                                                            readOnly={
                                                                !isOverride
                                                            }
                                                            value={
                                                                field.value
                                                                    ? formatCurrency(
                                                                          field.value,
                                                                      )
                                                                    : ''
                                                            }
                                                            onChange={(e) => {
                                                                if (
                                                                    isOverride
                                                                ) {
                                                                    const parsedValue =
                                                                        parseCurrency(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        );
                                                                    field.onChange(
                                                                        parsedValue,
                                                                    );
                                                                }
                                                            }}
                                                            onFocus={(e) => {
                                                                if (
                                                                    isOverride
                                                                ) {
                                                                    const currentValue =
                                                                        field.value ||
                                                                        0;
                                                                    e.target.value =
                                                                        currentValue.toString();
                                                                }
                                                            }}
                                                            onBlur={(e) => {
                                                                if (
                                                                    isOverride &&
                                                                    field.value
                                                                ) {
                                                                    e.target.value =
                                                                        formatCurrency(
                                                                            field.value,
                                                                        );
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <Toggle
                                                    variant="outline"
                                                    id="override-percent"
                                                    pressed={isOverride}
                                                    disabled={isFormDisabled}
                                                    onPressedChange={(
                                                        pressed,
                                                    ) => setIsOverride(pressed)}
                                                    className="ml-2"
                                                >
                                                    <SquarePen />
                                                </Toggle>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Waktu Bayar */}
                                <FormField
                                    control={form.control}
                                    name="waktu_bayar"
                                    render={({ field }) => (
                                        <FormItem className="space-y-2">
                                            <FormLabel>
                                                Waktu Pembayaran
                                            </FormLabel>
                                            <div className="flex items-center gap-1">
                                                <FormControl>
                                                    <DateTimePicker
                                                        isDisabled={
                                                            isFormDisabled
                                                        }
                                                        selectedDate={
                                                            field.value ||
                                                            new Date()
                                                        }
                                                        setSelectedDate={(
                                                            date,
                                                        ) => {
                                                            field.onChange(
                                                                date,
                                                            );
                                                            setWaktuBayarNow(
                                                                false,
                                                            );
                                                        }}
                                                    />
                                                </FormControl>
                                                <Toggle
                                                    variant="outline"
                                                    pressed={waktuBayarNow}
                                                    disabled={isFormDisabled}
                                                    onPressedChange={(
                                                        pressed,
                                                    ) => {
                                                        setWaktuBayarNow(
                                                            pressed,
                                                        );
                                                        if (pressed) {
                                                            field.onChange(
                                                                new Date(),
                                                            );
                                                        }
                                                    }}
                                                    className="ml-2"
                                                >
                                                    <RefreshCw />
                                                </Toggle>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                {/* Catatan */}
                                <FormField
                                    control={form.control}
                                    name="desc"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Catatan Pembayaran
                                            </FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    disabled={isFormDisabled}
                                                    placeholder="Masukkan catatan pembayaran"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="my-6 items-center text-center text-white">
                        <Button
                            size="lg"
                            type="submit"
                            disabled={isPending || isFormDisabled}
                            className="text-lg"
                        >
                            {isPending ? (
                                <span className="flex items-center flex-row gap-2">
                                    <SpokeSpinner size="lg" color="white" />{' '}
                                    Menyimpan
                                </span>
                            ) : (
                                'Simpan'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
