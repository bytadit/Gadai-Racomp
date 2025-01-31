'use client';
import * as React from 'react';
import { useState, ChangeEvent, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleCheckBig, Plus, Trash2 } from 'lucide-react';
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
import { FileUploader } from '@/components/file-uploader';
import { cn } from '@/lib/utils';
type FileWithFileName = {
    file: File;
    fileName: string;
};

const MAX_FILE_SIZE = 2000000;
const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
];

const customerSchema = z.object({
    image: z
        .array(
            z.object({
                file: z.instanceof(File),
                fileName: z.string(),
            }),
        )
        .refine(
            (files) => files.every((file) => file.file.size <= MAX_FILE_SIZE),
            `Ukuran maksimal file 2MB.`,
        )
        .refine(
            (files) =>
                files.every((file) =>
                    ACCEPTED_IMAGE_TYPES.includes(file.file.type),
                ),
            'Hanya format .jpg, .jpeg, .png, and .webp yang diterima.',
        ),
    name: z
        .string()
        .min(3, {
            message: 'Nama pelanggan minimal 3 karakter!',
        })
        .nonempty({
            message: 'Masukkan nama pelanggan!',
        }),
    phone_numbers: z
        .array(
            z.object({
                phone_number: z
                    .string()
                    .min(5, {
                        message: 'Nomor telepon minimal 5 digit!',
                    })
                    .max(15, { message: 'Nomor telepon maksimal 15 digit!' })
                    .regex(/^0[0-9]+$/, {
                        message:
                            'Nomor telepon harus dimulai dengan 0 dan hanya berisi angka',
                    })
                    .nonempty({
                        message: 'Masukkan nomor telepon pelanggan!',
                    }),
                is_active: z.boolean().optional(),
                is_whatsapp: z.boolean().optional(),
            }),
        )
        .nonempty({ message: 'Masukkan setidaknya satu nomor telepon!' }),
    nik: z
        .string()
        .nonempty({ message: 'Masukkan NIK pelanggan!' })
        .refine(
            async (nik) => {
                const res = await fetch('/api/customers/check-nik', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nik }),
                });
                const { isUnique } = await res.json();
                return isUnique;
            },
            { message: 'NIK sudah terdaftar!' },
        ),
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
            phone_numbers: [
                { phone_number: '', is_active: false, is_whatsapp: true },
            ],
            birthdate: undefined,
            gender: undefined,
            status: 'AMAN',
        },
        mode: 'onBlur',
        shouldFocusError: true,
    });
    const [phoneNumbers, setPhoneNumbers] = useState<
        z.infer<typeof customerSchema>['phone_numbers']
    >([{ phone_number: '', is_active: true, is_whatsapp: true }]);
    useEffect(() => {
        form.setValue('phone_numbers', phoneNumbers);
    }, [phoneNumbers, form]);
    const router = useRouter();
    const [isPending, setIsPending] = React.useState(false);
    const handlePhoneChange = (index: number, value: string) => {
        setPhoneNumbers((prevPhones) => {
            const updatedPhones = [...prevPhones];
            updatedPhones[index].phone_number = value;
            return updatedPhones as z.infer<
                typeof customerSchema
            >['phone_numbers'];
        });
    };
    const handleAddPhone = () => {
        setPhoneNumbers((prevPhones) => [
            ...prevPhones,
            {
                phone_number: '',
                is_active: prevPhones.length === 0,
                is_whatsapp: false,
            },
        ]);
    };
    const handleRemovePhone = (index: number) => {
        setPhoneNumbers((prevPhones) => {
            const updatedPhones = prevPhones.filter((_, i) => i !== index);
            if (prevPhones[index].is_active && updatedPhones.length > 0) {
                updatedPhones[0].is_active = true;
            }
            return updatedPhones as z.infer<
                typeof customerSchema
            >['phone_numbers'];
        });
    };
    const handleSetActive = (index: number) => {
        setPhoneNumbers(
            (prevPhones) =>
                prevPhones.map((phone, i) => ({
                    ...phone,
                    is_active: i === index,
                })) as z.infer<typeof customerSchema>['phone_numbers'],
        );
    };
    const handleSetWhatsapp = (index: number) => {
        setPhoneNumbers(
            (prevPhones) =>
                prevPhones.map((phone, i) =>
                    i === index
                        ? { ...phone, is_whatsapp: !phone.is_whatsapp }
                        : phone,
                ) as z.infer<typeof customerSchema>['phone_numbers'],
        );
    };

    const onSubmit = async (values: z.infer<typeof customerSchema>) => {
        setIsPending(true);
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
            const { customer } = await customerResponse.json();
            const customerId = customer.id;
            const phoneData = phoneNumbers.map((phone) => ({
                customer_id: customerId,
                phone_number: phone.phone_number,
                is_active: phone.is_active,
                is_whatsapp: phone.is_whatsapp,
            }));
            const phonesResponse = await fetch('/api/customer-phones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(phoneData),
            });
            if (!phonesResponse.ok)
                throw new Error('Failed to save phone numbers');
            const mimeToExtension: { [key: string]: string } = {
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'application/pdf': 'pdf',
                'text/plain': 'txt',
            };
            if (values.image && values.image.length > 0) {
                await Promise.all(
                    values.image.map(async (file: FileWithFileName) => {
                        const fileName = `Customer-${customerId}_${file.fileName}`; // fileName should be a separate property
                        const fileType = file.file.type; // e.g., "image/jpeg"
                        const extension = mimeToExtension[fileType] || 'bin';
                        const fileNameWithExtension = `${fileName}.${extension}`;
                        if (!fileName) {
                            throw new Error('Nama wajib diisi!');
                        }
                        const formData = new FormData();
                        formData.append('file', file.file);
                        formData.append('fileName', fileNameWithExtension);
                        const uploadResponse = await fetch(
                            '/api/customer-documents/upload',
                            {
                                method: 'POST',
                                body: formData,
                            },
                        );
                        if (!uploadResponse.ok) {
                            throw new Error('Failed to upload file');
                        }
                        const { publicUrl } = await uploadResponse.json();
                        const docResponse = await fetch(
                            '/api/customer-documents',
                            {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    customer_id: customerId,
                                    file_name: fileName,
                                    doc_url: publicUrl,
                                }),
                            },
                        );
                        if (!docResponse.ok) {
                            throw new Error('Failed to save file metadata');
                        }
                        return docResponse.json();
                    }),
                );
            }
            router.push(`/dashboard/pelanggan/${customerId}`);
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="mx-auto w-full">
                    <CardHeader>
                        <CardTitle className="text-left text-2xl font-bold">
                            Data Pelanggan Baru
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Dokumen Pelanggan */}
                        <FormField
                            control={form.control}
                            name="image"
                            render={({ field }) => (
                                <div className="space-y-6">
                                    <FormItem className="w-full">
                                        <FormLabel>
                                            Dokumen (Foto) Pelanggan
                                        </FormLabel>
                                        <FormControl>
                                            <FileUploader
                                                value={field.value || []}
                                                onValueChange={(files) =>
                                                    field.onChange(files)
                                                }
                                                maxFiles={4}
                                                maxSize={4 * 1024 * 1024}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                </div>
                            )}
                        />
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
                            {/* Nama Pelanggan */}
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
                            {/* NIK Pelanggan */}
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
                            {/* Tanggal Lahir */}
                            <FormField
                                control={form.control}
                                name="birthdate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tanggal Lahir</FormLabel>
                                        <FormControl>
                                            <DatePicker
                                                selectedDate={field.value}
                                                setSelectedDate={(date) => {
                                                    if (date instanceof Date) {
                                                        // Ensure UTC date is stored
                                                        const utcDate =
                                                            new Date(
                                                                Date.UTC(
                                                                    date.getFullYear(),
                                                                    date.getMonth(),
                                                                    date.getDate(),
                                                                ),
                                                            );
                                                        field.onChange(utcDate);
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-6">
                                {/* Status */}
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
                                {/* Gender */}
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
                            {/* Alamat */}
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
                            {/* Catatan */}
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
                            {/* No Telepon */}
                            <div className="w-full items-center">
                                <Label className="mb-2" htmlFor="phone_number">
                                    Nomor Telepon
                                </Label>
                                {phoneNumbers.map((phone, index) => (
                                    <div
                                        className="flex flex-col gap-2"
                                        key={index}
                                    >
                                        <div className="grid grid-cols-8 gap-1 mt-4">
                                            <div className="flex flex-row gap-1 items-center col-span-2">
                                                <Button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSetActive(index)
                                                    }
                                                    className={cn(
                                                        'text-xs px-2 py-1.5 w-full',
                                                        phone.is_active
                                                            ? 'text-white'
                                                            : 'text-dark dark:text-white',
                                                    )}
                                                    variant={
                                                        phone.is_active
                                                            ? 'success'
                                                            : 'outline'
                                                    }
                                                >
                                                    {phone.is_active ? (
                                                        <CircleCheckBig
                                                            color="white"
                                                            size={16}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    className={cn(
                                                        'text-xs px-2 py-1.5 w-full',
                                                        phone.is_whatsapp
                                                            ? 'text-white'
                                                            : 'text-dark dark:text-white',
                                                    )}
                                                    onClick={() =>
                                                        handleSetWhatsapp(index)
                                                    }
                                                    variant={
                                                        phone.is_whatsapp
                                                            ? 'whatsapp'
                                                            : 'outline'
                                                    }
                                                >
                                                    {phone.is_whatsapp ? (
                                                        <FaWhatsapp
                                                            color="white"
                                                            size={16}
                                                        />
                                                    ) : (
                                                        ''
                                                    )}
                                                </Button>
                                            </div>
                                            <Input
                                                className="col-span-5"
                                                type="text"
                                                placeholder="Nomor telepon..."
                                                {...form.register(
                                                    `phone_numbers.${index}.phone_number`,
                                                )}
                                                name={`phone_numbers.${index}.phone_number`}
                                                value={phone.phone_number}
                                                onChange={(
                                                    e: ChangeEvent<HTMLInputElement>,
                                                ) => {
                                                    handlePhoneChange(
                                                        index,
                                                        e.target.value,
                                                    );
                                                    form.trigger(
                                                        `phone_numbers.${index}.phone_number`,
                                                    );
                                                }}
                                            />
                                            <div className="col-span-1">
                                                {index > 0 ? (
                                                    <Button
                                                        type="button"
                                                        className="px-2 py-1.5 w-full"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleRemovePhone(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        className="px-2 py-1.5 w-full"
                                                        type="button"
                                                        onClick={handleAddPhone}
                                                    >
                                                        <Plus size={16} />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        {form.formState.errors.phone_numbers?.[
                                            index
                                        ]?.phone_number && (
                                            <p className="text-destructive text-xs font-semibold">
                                                {
                                                    form.formState.errors
                                                        .phone_numbers[index]
                                                        .phone_number.message
                                                }
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
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
                            'Simpan'
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
