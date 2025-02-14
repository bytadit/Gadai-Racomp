'use client';
import * as React from 'react';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { formatCurrency, parseCurrency } from '@/lib/utils';
import { DateTimePicker } from '@/components/date-time-picker';
import { Toggle } from '@/components/ui/toggle';
import {
    calculateSisaTanggungan,
    calculateStatusCicilan,
    calculateStatusTransaksi,
    calculateTanggunganAkhir,
} from '@/lib/transaction-helper';

type Transaction = {
    id: number;
    status_transaksi: string;
    type: string;
    waktu_pinjam: string;
    itemId: number;
    sisa_tanggungan: any;
    tanggungan_awal: any;
    tgl_jatuh_tempo: string;
    persen_tanggungan: any;
    nilai_pinjaman: any;
    tanggungan_akhir: any;
    cashflows: Cashflow[];
};

type Cashflow = {
    id: number;
    termin: number;
    tanggungan: number;
    amount: number;
    payment_type: 'BNI' | 'BSI' | 'CASH';
    waktu_bayar: string;
    desc: string;
    transaction: Transaction;
    transactionId: number;
};

export default function EditCashflowForm({
    params,
}: {
    params: { cashflowId: string };
}) {
    const [initialTanggungan, setInitialTanggungan] = useState<number>(0);
    const [isOverride, setIsOverride] = useState<boolean>(false);
    const [waktuBayarNow, setWaktuBayarNow] = React.useState<boolean>(true);
    const [cashflowData, setCashflowData] = useState<Cashflow | null>(null);
    const [selectedTransaction, setSelectedTransaction] =
        useState<Transaction | null>(null);

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
        mode: 'onBlur',
        shouldFocusError: true,
    });

    const router = useRouter();
    const [isPending, setIsPending] = React.useState(false);

    useEffect(() => {
        fetch(`/api/cashflows/${params.cashflowId}`)
            .then((res) => res.json())
            .then((data: Cashflow) => {
                setCashflowData(data);
                setSelectedTransaction(data.transaction);

                fetch(
                    `/api/cashflows?storedTransactionId=${data.transaction.id}`,
                )
                    .then((res) => res.json())
                    .then((allCashflowData: Cashflow[]) => {
                        const sisaTanggungan = calculateSisaTanggungan({
                            transaction: {
                                id: data.transaction.id,
                                tanggungan_awal: Number(
                                    data.transaction.tanggungan_awal,
                                ),
                                tgl_jatuh_tempo:
                                    data.transaction.tgl_jatuh_tempo, // or new Date(data.transaction.tgl_jatuh_tempo) if needed
                                persen_tanggungan: Number(
                                    data.transaction.persen_tanggungan,
                                ),
                                nilai_pinjaman: Number(
                                    data.transaction.nilai_pinjaman,
                                ),
                            },
                            cashflows: allCashflowData, // Using the state variable which holds the fetched cashflows.
                        });

                        // Compute the correct initialTanggungan value
                        // const computedInitialTanggungan =
                        //     data.transaction.tanggungan_akhir - totalAmount

                        setInitialTanggungan(
                            sisaTanggungan + Number(data.amount),
                        );
                        // Now reset the form using the computed initialTanggungan
                        form.reset({
                            termin: data.termin,
                            payment_type: data.payment_type,
                            amount: data.amount,
                            tanggungan: sisaTanggungan, // Use the computed value here!
                            waktu_bayar: new Date(data.waktu_bayar),
                            desc: data.desc,
                        });
                    });
            });
    }, [params.cashflowId, form]);

    useEffect(() => {
        if (!isOverride) {
            const amount = form.watch('amount');
            const newTanggungan = initialTanggungan - amount;
            form.setValue('tanggungan', newTanggungan);
        }
    }, [form.watch('amount'), initialTanggungan, isOverride, form]);

    const onSubmit = async (values: z.infer<typeof cashflowSchema>) => {
        setIsPending(true);
        try {
            const response = await fetch(
                `/api/cashflows/${params.cashflowId}`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...values,
                    }),
                },
            );

            if (!response.ok) throw new Error('Failed to update');
            if (selectedTransaction) {
                let status_transaksi;
                let status_cicilan;
                let status_item;
                let waktu_kembali;
                const tanggunganAkhir = calculateTanggunganAkhir({
                    tanggungan_awal: selectedTransaction.tanggungan_awal,
                    tgl_jatuh_tempo: selectedTransaction.tgl_jatuh_tempo,
                    persen_tanggungan: selectedTransaction.persen_tanggungan,
                    nilai_pinjaman: selectedTransaction.nilai_pinjaman,
                });
                const statusTransaksi = calculateStatusTransaksi({
                    tgl_jatuh_tempo: selectedTransaction.tgl_jatuh_tempo,
                });
                const statusCicilan = calculateStatusCicilan({
                    tgl_jatuh_tempo: selectedTransaction.tgl_jatuh_tempo,
                    cashflows: selectedTransaction.cashflows,
                });
                if (values.tanggungan === 0) {
                    status_cicilan = statusCicilan;
                    status_transaksi = 'SELESAI';
                    status_item = 'KELUAR';
                    waktu_kembali = new Date();
                } else {
                    status_cicilan = statusCicilan;
                    status_transaksi = statusTransaksi;
                    status_item = 'MASUK';
                    waktu_kembali = null;
                }
                // Update transaction status
                await fetch(`/api/transactions/${selectedTransaction.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        status_transaksi: status_transaksi,
                        status_cicilan: status_cicilan,
                        tanggungan_akhir: tanggunganAkhir,
                        waktu_kembali: waktu_kembali,
                    }),
                });
                // Update item status
                await fetch(`/api/items/${selectedTransaction.itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ item_status: status_item }),
                });
            }
            router.push(`/dashboard/cashflow/${params.cashflowId}`);
            toast.success('Data cashflow berhasil diperbarui!');
        } catch (error: any) {
            console.log(`Error: ${error.message}`);
            toast.error('Gagal menyimpan perubahan!');
        } finally {
            setIsPending(false);
        }
    };

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <Card className="mx-auto w-full">
                        <CardHeader>
                            <CardTitle className="text-left text-2xl font-bold">
                                Edit Data Cashflow
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
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
                                                    disabled
                                                    readOnly
                                                    value={field.value}
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
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih tipe pembayaran" />
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
                                                            value={formatCurrency(
                                                                rawValue,
                                                            )}
                                                            onChange={(e) => {
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
                                                                );
                                                            }}
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
                                                            className={`pl-10 ${
                                                                !isOverride
                                                                    ? 'text-muted-foreground'
                                                                    : ''
                                                            }`}
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
                                                        />
                                                    </div>
                                                </FormControl>
                                                <Toggle
                                                    variant="outline"
                                                    pressed={isOverride}
                                                    onPressedChange={
                                                        setIsOverride
                                                    }
                                                    className="ml-2"
                                                >
                                                    <SquarePen />
                                                </Toggle>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                                                        isDisabled={false}
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
                            disabled={isPending}
                            className="text-lg"
                        >
                            {isPending ? (
                                <span className="flex items-center flex-row gap-2">
                                    <SpokeSpinner size="lg" color="white" />{' '}
                                    Menyimpan
                                </span>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </Button>
                    </div>
                </form>
            </Form>
        </>
    );
}
