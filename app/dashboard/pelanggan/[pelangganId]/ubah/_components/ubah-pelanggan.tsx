'use client';
import * as React from 'react';
import { useState, ChangeEvent, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, CircleCheckBig, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // For navigation
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
import { SpokeSpinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DatePicker from '@/components/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { TriangleAlert } from 'lucide-react';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { FaWhatsapp } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { DocumentEditor } from '@/components/document-editor';
type Customer = {
    id: number;
    name: string;
    nik: string;
    address: string;
    desc?: string;
    birthdate: string;
    gender: 'PRIA' | 'WANITA';
};
// type Phone = {
//     id?: number;
//     phone_number: string;
//     is_active: boolean;
// };
type DocumentType = 'FOTO' | 'DOKUMEN';

type DocumentState = 'original' | 'new' | 'edited' | 'deleted';
type CustomerDocument = {
    id?: number; // ID from the database
    name: string;
    doc_type: DocumentType;
    doc_url?: string; // URL for existing documents
    file?: File; // File object for new or edited documents
    state: DocumentState; // Tracks the state of the document
};

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
];

export default function EditCustomerForm({
    params,
}: {
    params: { pelangganId: string };
}) {
    const customerId = params.pelangganId;
    const customerSchema = z.object({
        name: z
            .string()
            .min(2, {
                message: 'Nama pelanggan minimal 2 karakter!',
            })
            .nonempty({
                message: 'Masukkan nama pelanggan!',
            }),
        phone_numbers: z
            .array(
                z.object({
                    id: z.number().optional(), // Add id as an optional property
                    phone_number: z
                        .string()
                        .min(5, {
                            message: 'Nomor telepon minimal 5 digit!',
                        })
                        .max(15, {
                            message: 'Nomor telepon maksimal 15 digit!',
                        })
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
                        body: JSON.stringify({ nik, customerId }),
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
        status: z
            .enum(['AMAN', 'FAVORIT', 'RISIKO', 'MASALAH'])
            .default('AMAN'),
        image: z
            .array(
                z.object({
                    file: z.instanceof(File),
                    fileName: z.string(),
                }),
            )
            .optional()
            .refine(
                (files) =>
                    !files ||
                    files.every((file) => file.file.size <= MAX_FILE_SIZE),
                `Max file size is 5MB.`,
            )
            .refine(
                (files) =>
                    !files ||
                    files.every((file) =>
                        ACCEPTED_IMAGE_TYPES.includes(file.file.type),
                    ),
                '.jpg, .jpeg, .png, and .webp files are accepted.',
            ),
    });
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
            image: [],
            phone_numbers: [
                { phone_number: '', is_active: false, is_whatsapp: true },
            ],
        },
        mode: 'onBlur', // Validate inputs on blur
        shouldFocusError: true, // Automatically focus the first error field
    });
    const router = useRouter();
    const [phoneNumbers, setPhoneNumbers] = useState<
        z.infer<typeof customerSchema>['phone_numbers']
    >([{ phone_number: '', is_active: true, is_whatsapp: true }]);
    useEffect(() => {
        form.setValue('phone_numbers', phoneNumbers);
    }, [phoneNumbers, form]);
    const [originalPhones, setOriginalPhones] = useState<
        z.infer<typeof customerSchema>['phone_numbers']
    >([{ phone_number: '', is_active: true, is_whatsapp: true }]);
    const [customer, setCustomer] = React.useState<Customer | null>(null);
    const [isPending, setIsPending] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [documentData, setDocumentData] = React.useState({
        initialDocuments: [] as CustomerDocument[],
        newDocuments: [] as CustomerDocument[],
        editedDocuments: [] as CustomerDocument[],
        deletedDocuments: [] as CustomerDocument[],
    });

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
        setPhoneNumbers((prevPhones) => {
            const newPhone = {
                phone_number: '',
                is_active: prevPhones.length === 0,
                is_whatsapp: false,
            };
            return [...prevPhones, newPhone];
        });
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

    const handleDocumentsChange = React.useCallback(
        (updatedData: {
            newDocuments: CustomerDocument[];
            editedDocuments: CustomerDocument[];
            deletedDocuments: CustomerDocument[];
        }) => {
            setDocumentData((prev) => ({
                ...prev,
                ...updatedData,
            }));
        },
        [],
    );
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
                        form.setValue('name', data.name);
                        form.setValue('nik', data.nik);
                        form.setValue('address', data.address);
                        form.setValue('desc', data.desc || '');
                        form.setValue('birthdate', new Date(data.birthdate));
                        form.setValue('gender', data.gender);
                        form.setValue('status', data.status);
                        setPhoneNumbers(
                            data.customerPhones || [
                                { phone_number: '', is_active: true },
                            ],
                        );
                        setOriginalPhones(
                            data.customerPhones || [
                                { phone_number: '', is_active: true },
                            ],
                        );

                        const initialDocuments = data.customerDocuments.map(
                            (doc: any) => ({
                                id: doc.id,
                                name: doc.name,
                                doc_type: doc.doc_type || 'Other',
                                doc_url: doc.doc_url,
                                state: 'original',
                            }),
                        );

                        setDocumentData((prev) => ({
                            ...prev,
                            initialDocuments,
                        }));
                        setLoading(false);
                    } else {
                        console.error('Failed to fetch customer data');
                        return (
                            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                                <TriangleAlert
                                    size={32}
                                    className="text-destructive"
                                />
                                <span className="text-md text-destructive font-medium">
                                    Data Pelanggan Tidak Ditemukan !
                                </span>
                            </div>
                        );
                    }
                } catch (error) {
                    console.error('Error fetching customer:', error);
                }
            };
            fetchCustomer();
        }
    }, [params.pelangganId, form]);
    if (loading) {
        return (
            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                <SpokeSpinner size="md" />
                <span className="text-md font-medium text-muted-foreground">
                    Memuat data pelanggan...
                </span>
            </div>
        );
    }

    const onSubmit = async (values: z.infer<typeof customerSchema>) => {
        setIsPending(true); // Set loading state to true
        try {
            const method = 'PUT';
            const url = `/api/customers/${params.pelangganId}`;
            const customerResponse = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!customerResponse.ok) {
                throw new Error('Failed to save customer data');
            }
            const { customer } = await customerResponse.json();
            const customerId = customer.id;
            // Phone Numbers
            const updatedPhones = phoneNumbers.filter((phone) => phone.id);
            const newPhones = phoneNumbers.filter((phone) => !phone.id);
            const removedPhones = originalPhones.filter(
                (phone) => !phoneNumbers.some((p) => p.id === phone.id),
            );
            await Promise.all([
                fetch('/api/customer-phones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(
                        newPhones.map((phone) => ({
                            ...phone,
                            customer_id: customerId,
                        })),
                    ), // Send all new phones as an array
                }),
                ...updatedPhones.map((phone) =>
                    fetch(`/api/customer-phones/${phone.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(phone),
                    }),
                ),
                ...removedPhones.map((phone) =>
                    fetch(`/api/customer-phones/${phone.id}`, {
                        method: 'DELETE',
                    }),
                ),
            ]);

            // Customer Documents
            const { newDocuments, editedDocuments, deletedDocuments } =
                documentData;
            // Handle new documents (upload and save)
            for (const newDoc of newDocuments) {
                const formData = new FormData();
                if (newDoc.file) {
                    formData.append('file', newDoc.file); // Append only if file exists
                } else {
                    console.error('File is undefined for document:', newDoc);
                }
                formData.append('fileName', newDoc.name);

                // Upload file to storage
                const uploadResponse = await fetch(
                    '/api/customer-documents/upload',
                    {
                        method: 'POST',
                        body: formData,
                    },
                );

                if (!uploadResponse.ok) {
                    throw new Error(`Failed to upload file: ${newDoc.name}`);
                }

                const { publicUrl } = await uploadResponse.json();

                // Save metadata to database
                const docResponse = await fetch('/api/customer-documents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customer_id: customerId,
                        file_name: newDoc.name,
                        doc_url: publicUrl,
                    }),
                });

                if (!docResponse.ok) {
                    throw new Error(`Failed to save document: ${newDoc.name}`);
                }
            }
            // Handle edited documents (update metadata in database)
            for (const editedDoc of editedDocuments) {
                const formData = new FormData();
                if (editedDoc.file) {
                    formData.append('file', editedDoc.file);
                } else {
                    console.error('File is undefined for document:', editedDoc);
                }
                formData.append('fileName', editedDoc.name);

                // Upload new version of file to storage
                const uploadResponse = await fetch(
                    '/api/customer-documents/upload',
                    {
                        method: 'POST',
                        body: formData,
                    },
                );

                if (!uploadResponse.ok) {
                    throw new Error(`Failed to upload file: ${editedDoc.name}`);
                }

                const { publicUrl } = await uploadResponse.json();

                // Update metadata in database
                const docResponse = await fetch(
                    `/api/customer-documents/${editedDoc.id}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: editedDoc.name,
                            doc_url: publicUrl,
                            customer_id: customerId,
                            doc_type: 'FOTO',
                        }),
                    },
                );

                if (!docResponse.ok) {
                    throw new Error(
                        `Failed to update document: ${editedDoc.name}`,
                    );
                }
            }

            // Handle deleted documents
            for (const deletedDoc of deletedDocuments) {
                const deleteResponse = await fetch(
                    `/api/customer-documents/${deletedDoc.id}`,
                    {
                        method: 'DELETE',
                    },
                );

                if (!deleteResponse.ok) {
                    throw new Error(
                        `Failed to delete document: ${deletedDoc.name}`,
                    );
                }
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
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Card className="mx-auto w-full">
                    <CardHeader className="flex items-center flex-row space-x-2 justify-between">
                        <CardTitle className="text-left text-2xl font-bold">
                            Ubah Data Pelanggan {customer?.name}
                        </CardTitle>
                        <Link
                            href={`/dashboard/pelanggan/${customer?.id}`}
                            className={buttonVariants({ variant: 'outline' })}
                        >
                            <ArrowLeft />
                            {/* {' Kembali'} */}
                        </Link>
                    </CardHeader>
                    <CardContent>
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
                                {phoneNumbers.length === 0 && (
                                    <div className="grid grid-cols-8 gap-1.5 mt-4">
                                        <div className="col-span-1">
                                            <Button
                                                type="button"
                                                variant={'secondary'}
                                                onClick={handleAddPhone}
                                            >
                                                {'Masukkan Nomor Telepon'}
                                                <Plus />
                                            </Button>
                                        </div>
                                    </div>
                                )}
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
                                                )} // React Hook Form tracking
                                                name={`phone_numbers.${index}.phone_number`}
                                                value={phone.phone_number}
                                                onChange={(
                                                    e: ChangeEvent<HTMLInputElement>,
                                                ) => {
                                                    handlePhoneChange(
                                                        index,
                                                        e.target.value,
                                                    ); // Update local state
                                                    form.trigger(
                                                        `phone_numbers.${index}.phone_number`,
                                                    ); // Trigger validation
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
                <Card className="mx-auto w-full my-6">
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="image"
                            render={() => (
                                <FormItem>
                                    <DocumentEditor
                                        initialDocuments={[
                                            ...documentData.initialDocuments,
                                            ...documentData.newDocuments,
                                        ]}
                                        onDocumentsChange={
                                            handleDocumentsChange
                                        }
                                        dataName={`Pelanggan ${customer?.name}`}
                                    />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>
                <div className="my-6 text-center items-center">
                    <Button
                        type="submit"
                        size="lg"
                        variant="success"
                        disabled={isPending}
                        className="text-lg text-white"
                    >
                        {isPending ? (
                            <span className="flex items-center flex-row gap-2">
                                <SpokeSpinner color="white" size="lg" />{' '}
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
