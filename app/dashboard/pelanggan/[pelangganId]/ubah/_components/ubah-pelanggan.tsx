'use client';
import * as React from 'react';
import { useState, ChangeEvent } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, CircleCheckBig } from 'lucide-react';
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
import { SpokeSpinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DatePicker from '@/components/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { TriangleAlert } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { FileUploader } from '@/components/file-uploader';

type Customer = {
    id: number;
    name: string;
    nik: string;
    address: string;
    desc?: string;
    birthdate: string;
    gender: 'PRIA' | 'WANITA';
};
type Phone = {
    id?: number;
    phone_number: string;
    is_active: boolean;
};
type Document = {
    id?: number;
    name: string;
    doc_url: string;
};
type FileWithFileName = {
    id?: number; // Optional for existing documents
    file: File; // The actual File object
    fileName: string; // The custom file name provided by the user
};

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
];
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
    image: z
        .array(
            z.object({
                file: z.instanceof(File), // Ensure it's a `File` instance
                fileName: z.string(), // Ensure it includes the filename
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
            image: [],
        },
    });

    const router = useRouter();
    const [phoneNumbers, setPhoneNumbers] = useState<Phone[]>([
        { phone_number: '', is_active: true },
    ]);
    const [originalPhones, setOriginalPhones] = useState<Phone[]>([]);
    const [customerDocuments, setCustomerDocuments] = useState<
        FileWithFileName[]
    >([]);
    const [originalDocuments, setOriginalDocuments] = useState<Document[]>([]);
    const [customer, setCustomer] = React.useState<Customer | null>(null);
    const [isPending, setIsPending] = React.useState(false); // ✅ isPending state
    const [loading, setLoading] = React.useState(true); // ✅ isPending state

    const handlePhoneChange = (index: number, value: string) => {
        setPhoneNumbers((prevPhones) => {
            const updatedPhones = [...prevPhones];
            updatedPhones[index].phone_number = value;
            return updatedPhones;
        });
    };

    const handleAddPhone = () => {
        setPhoneNumbers((prevPhones) => {
            const newPhone = {
                phone_number: '',
                is_active: prevPhones.length === 0,
                is_whatsapp: true,
            };
            return [...prevPhones, newPhone];
        });
    };

    const handleRemovePhone = (index: number) => {
        setPhoneNumbers((prevPhones) =>
            prevPhones.filter((_, i) => i !== index),
        );
    };

    const handleSetActive = (index: number) => {
        setPhoneNumbers((prevPhones) =>
            prevPhones.map((phone, i) => ({
                ...phone,
                is_active: i === index,
            })),
        );
    };

    // Document management
    const handleAddDocument = () => {
        setCustomerDocuments((prevDocuments) => [
            ...prevDocuments,
            { file: new File([], ''), fileName: '', id: undefined }, // Matches FileWithFileName type
        ]);
    };
    
    const handleDocumentChange = (index: number, fileName: string) => {
        setCustomerDocuments((prevDocuments) => {
            const updatedDocuments = [...prevDocuments];
            updatedDocuments[index] = {
                ...updatedDocuments[index],
                fileName, // Update the fileName instead of name
            };
            return updatedDocuments;
        });
    };
    
    

    const handleRemoveDocument = (index: number) => {
        setCustomerDocuments((prevDocuments) =>
            prevDocuments.filter((_, i) => i !== index),
        );
    };

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
                        setCustomerDocuments(data.customerDocuments || []);
                        setOriginalDocuments(data.customerDocuments || []);
                        // setCustomer(data);
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
            const updatedPhones = phoneNumbers.filter((phone) => phone.id);
            const newPhones = phoneNumbers.filter((phone) => !phone.id);
            const removedPhones = originalPhones.filter(
                (phone) => !phoneNumbers.some((p) => p.id === phone.id),
            );
            const mimeToExtension: { [key: string]: string } = {
                'image/jpeg': 'jpg',
                'image/png': 'png',
                'application/pdf': 'pdf',
                'text/plain': 'txt',
            };
            const images = values.image || [];
            // Separate new, updated, and removed documents
            const newDocuments: FileWithFileName[] = images.filter(
                (file): file is FileWithFileName => !('id' in file),
            ); // Files without an id are new
            const updatedDocuments: FileWithFileName[] = images.filter(
                (file): file is FileWithFileName =>
                    'id' in file &&
                    originalDocuments.some(
                        (orig) =>
                            orig.id === file.id && orig.name !== file.fileName,
                    ),
            ); // Files with an id and a changed name
            const removedDocuments = originalDocuments.filter(
                (doc) =>
                    !images.some((file) => 'id' in file && file.id === doc.id),
            ); // Documents that are in originalDocuments but not in images
            if (newDocuments.length > 0) {
                await Promise.all(
                    newDocuments.map(async (file: FileWithFileName) => {
                        const fileName = `Customer-${customer.id}_${file.fileName}`;
                        const fileType = file.file.type; // e.g., "image/jpeg"
                        const extension = mimeToExtension[fileType] || 'bin';
                        const fileNameWithExtension = `${fileName}.${extension}`;
                        if (!fileName)
                            throw new Error('File name is required.');
                        const formData = new FormData();
                        formData.append('file', file.file); // Append the file object
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
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    customer_id: customer.id,
                                    file_name: fileName,
                                    doc_url: publicUrl,
                                }),
                            },
                        );

                        if (!docResponse.ok) {
                            throw new Error('Failed to save document metadata');
                        }
                    }),
                );
            }
            if (updatedDocuments.length > 0) {
                await Promise.all(
                    updatedDocuments.map((doc) =>
                        fetch(`/api/customer-documents/${doc.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                file_name: doc.fileName, // Update file name
                            }),
                        }),
                    ),
                );
            }
            if (removedDocuments.length > 0) {
                await Promise.all(
                    removedDocuments.map((doc) =>
                        fetch(`/api/customer-documents/${doc.id}`, {
                            method: 'DELETE',
                        }),
                    ),
                );
            }
            await Promise.all([
                fetch('/api/customer-phones', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(
                        newPhones.map((phone) => ({
                            ...phone,
                            customer_id: customer.id,
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
                                        className="grid grid-cols-8 gap-1.5 mt-4"
                                        key={index}
                                    >
                                        <Button
                                            type="button"
                                            onClick={() =>
                                                handleSetActive(index)
                                            }
                                            variant={
                                                phone.is_active
                                                    ? 'success'
                                                    : 'outline'
                                            }
                                        >
                                            {phone.is_active ? (
                                                <CircleCheckBig color="white" />
                                            ) : (
                                                ''
                                            )}
                                        </Button>
                                        <Input
                                            autoFocus
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
                                                    variant="destructive"
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
