'use client';
import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DatePicker from '@/components/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
type Customer = {
    id: number;
    name: string;
    nik: string;
    address: string;
    desc?: string;
    birthdate: string;
    gender: 'PRIA' | 'WANITA';
};
const customerSchema = z.object({
    name: z
        .string()
        .min(2, {
            message: 'Nama pelanggan minimal 2 karakter!',
        })
        .nonempty({
            message: 'Masukkan nama pelanggan!',
        }),
    nik: z.string().nonempty({
        message: 'Masukkan NIK pelanggan!',
    }),
    address: z.string().nonempty({
        message: 'Masukkan alamat pelanggan!',
    }),
    desc: z.string().optional(),
    birthdate: z.date({
        required_error: 'Masukkan tanggal lahir pelanggan!',
    }),
    gender: z.enum(['PRIA', 'WANITA'], {
        required_error: 'Pilih jenis kelamin pelanggan!',
    }),
    status: z.enum(['AMAN', 'FAVORIT', 'RISIKO', 'MASALAH']).default('AMAN'),
});

export default function EditCustomerForm({
    params,
}: {
    params: { pelangganId: string };
}) {
    const form = useForm<z.infer<typeof customerSchema>>({
        resolver: zodResolver(customerSchema),
        defaultValues: {
            name: '',
            nik: '',
            address: '',
            desc: '',
            birthdate: undefined,
            gender: undefined,
            status: 'AMAN',
        },
    });

    const router = useRouter();
    const [customer, setCustomer] = React.useState<Customer | null>(null);
    const [isPending, setIsPending] = React.useState(false); // ✅ isPending state

    // ✅ Fetch and prefill data if editing
    React.useEffect(() => {
        if (params.pelangganId) {
            const fetchCustomer = async () => {
                try {
                    const response = await fetch(
                        `/api/customers/${params.pelangganId}`,
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setCustomer(data);

                        // ✅ Populate form fields with fetched data
                        form.setValue('name', data.name);
                        form.setValue('nik', data.nik);
                        form.setValue('address', data.address);
                        form.setValue('desc', data.desc || '');
                        form.setValue('birthdate', new Date(data.birthdate));
                        form.setValue('gender', data.gender);
                        form.setValue('status', data.status);

                        // setCustomer(data);
                    } else {
                        console.error('Failed to fetch customer data');
                    }
                } catch (error) {
                    console.error('Error fetching customer:', error);
                }
            };
            fetchCustomer();
        }
    }, [params.pelangganId, form]);

    const onSubmit = async (values: z.infer<typeof customerSchema>) => {
        setIsPending(true); // Set loading state to true
        try {
            const method = 'PUT';
            const url = `/api/customers/${params.pelangganId}`;
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!response.ok) {
                throw new Error('Failed to save customer data');
            }
            router.push(`/dashboard/pelanggan/${params.pelangganId}`);
            toast.success('Data pelanggan berhasil diubah!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Data pelanggan gagal diubah!');
        } finally {
            setIsPending(false);
            router.refresh();
        }
    };
    return (
        <Card className="mx-auto w-full">
            <CardHeader>
                <CardTitle className="text-left text-2xl font-bold">
                    Ubah Data Pelanggan {customer?.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-8"
                    >
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Pelanggan</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Masukkan nama pelanggan"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="nik"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>NIK Pelanggan</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Masukkan NIK pelanggan"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="birthdate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tanggal Lahir</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                selectedDate={field.value}
                                                setSelectedDate={(date) =>
                                                    field.onChange(date)
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>
                                                Status Pelanggan
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Pilih status" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="AMAN">
                                                        Aman
                                                    </SelectItem>
                                                    <SelectItem value="FAVORIT">
                                                        Favorit
                                                    </SelectItem>
                                                    <SelectItem value="RISIKO">
                                                        Risiko
                                                    </SelectItem>
                                                    <SelectItem value="MASALAH">
                                                        Masalah
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="gender"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Jenis Kelamin</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                    className="flex space-x-4"
                                                >
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <RadioGroupItem value="PRIA" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Pria
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <RadioGroupItem value="WANITA" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Wanita
                                                        </FormLabel>
                                                    </FormItem>
                                                </RadioGroup>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Alamat Pelanggan</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Masukkan alamat pelanggan"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="desc"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Catatan Pelanggan</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Masukkan catatan pelanggan"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? 'Menyimpan...' : 'Simpan'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
