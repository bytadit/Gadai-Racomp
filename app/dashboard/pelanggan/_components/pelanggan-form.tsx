'use client';
import * as React from 'react';
import { useState, ChangeEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DatePicker from '@/components/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { SpokeSpinner } from '@/components/ui/spinner';
import { Label } from '@/components/ui/label';
// import { createCustomer } from '@/lib/actions';

type Phone = {
    phone_number: string;
    is_active: boolean;
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

export default function CustomerForm() {
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
    const [phoneNumbers, setPhoneNumbers] = useState<Phone[]>([
        { phone_number: '', is_active: true },
    ]);
    const router = useRouter();
    const [isPending, setIsPending] = React.useState(false); // ✅ isPending state

    const handlePhoneChange = (index: number, value: string) => {
        setPhoneNumbers((prevPhones) => {
            const updatedPhones = [...prevPhones];
            updatedPhones[index].phone_number = value;
            return updatedPhones;
        });
    };

    const handleAddPhone = () => {
        setPhoneNumbers((prevPhones) => [
            ...prevPhones,
            { phone_number: '', is_active: false },
        ]);
    };

    const handleRemovePhone = (index: number) => {
        setPhoneNumbers((prevPhones) => {
            const updatedPhones = prevPhones.filter((_, i) => i !== index);
            if (prevPhones[index].is_active && updatedPhones.length > 0) {
                updatedPhones[0].is_active = true;
            }
            return updatedPhones;
        });
    };

    const handleSetActive = (index: number) => {
        setPhoneNumbers((prevPhones) =>
            prevPhones.map((phone, i) => ({
                ...phone,
                is_active: i === index,
            })),
        );
    };

    const onSubmit = async (values: z.infer<typeof customerSchema>) => {
        setIsPending(true); // Set loading state to true
        try {
            const customerResponse = await fetch('/api/customers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });
            if (!customerResponse.ok) {
                throw new Error('Failed to save customer data');
            }

            // const customer = await customerResponse.json();
            // const customerId = customer.id;
            const { customer } = await customerResponse.json();
            const customerId = customer.id;

            // console.log(customerId);
            const phoneData = phoneNumbers.map((phone) => ({
                customer_id: customerId,
                phone_number: phone.phone_number,
                is_active: phone.is_active,
            }));

            const phonesResponse = await fetch('/api/customer-phones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(phoneData),
            });

            if (!phonesResponse.ok)
                throw new Error('Failed to save phone numbers');

            router.push('/dashboard/pelanggan');
            toast.success(`Data pelanggan berhasil dibuat!`);
        } catch (error) {
            console.error('Error:', error);
            toast.error('Data pelanggan gagal dibuat');
        } finally {
            setIsPending(false);
            router.refresh();
        }
    };

    return (
        <Card className="mx-auto w-full">
            <CardHeader>
                <CardTitle className="text-left text-2xl font-bold">
                    Data Pelanggan Baru
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
                            <div className="w-full items-center">
                                <Label className="mb-2" htmlFor="phone_number">
                                    Nomor Telepon
                                </Label>
                                {phoneNumbers.map((phone, index) => (
                                    <div
                                        className="grid grid-cols-8 gap-1.5 mt-4"
                                        key={index}
                                    >
                                        <Input
                                            className="col-span-1 w-8"
                                            type="radio"
                                            checked={phone.is_active}
                                            onChange={() =>
                                                handleSetActive(index)
                                            }
                                            title="Set as Active"
                                        />
                                        <Input
                                            className="col-span-6"
                                            type="text"
                                            placeholder="Nomor telepon..."
                                            value={phone.phone_number}
                                            onChange={(
                                                e: ChangeEvent<HTMLInputElement>,
                                            ) =>
                                                handlePhoneChange(
                                                    index,
                                                    e.target.value,
                                                )
                                            }
                                        />
                                        <div className="col-span-1 ml-2">
                                            {index > 0 ? (
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRemovePhone(index)
                                                    }
                                                >
                                                    <Trash2 />
                                                </Button>
                                            ) : (
                                                <Button
                                                    type="button"
                                                    onClick={handleAddPhone}
                                                >
                                                    <Plus />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <span className="flex items-center flex-row gap-2">
                                    <SpokeSpinner size="xs" /> Menyimpan
                                </span>
                            ) : (
                                'Simpan'
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
