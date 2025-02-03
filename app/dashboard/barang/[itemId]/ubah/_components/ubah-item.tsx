'use client';
import * as React from 'react';
// import { useState, ChangeEvent, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // For navigation
import { toast } from 'sonner';
// import {
//     Select,
//     SelectContent,
//     SelectItem,
//     SelectTrigger,
//     SelectValue,
// } from '@/components/ui/select';
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
// import DatePicker from '@/components/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { TriangleAlert } from 'lucide-react';
// import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { formatCurrency, parseCurrency } from '@/lib/utils';
import { DocumentEditor } from '@/components/document-editor';

type Item = {
    id: number;
    name: string;
    type: 'KENDARAAN' | 'OTHER';
    desc?: string;
    year: number;
    value: any;
    brand: string;
    serial: string;
};

type DocumentType = 'FOTO' | 'DOKUMEN';
type DocumentState = 'original' | 'new' | 'edited' | 'deleted';

type ItemDocument = {
    id?: number;
    name: string;
    doc_type: DocumentType;
    doc_url?: string;
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

export default function EditItemForm({
    params,
}: {
    params: { itemId: string };
}) {
    const itemId = params.itemId;
    const itemSchema = z
        .object({
            name: z
                .string()
                .min(3, {
                    message: 'Nama barang minimal 3 karakter!',
                })
                .nonempty({
                    message: 'Masukkan nama barang!',
                }),
            type: z.enum(['KENDARAAN', 'OTHER'], {
                required_error: 'Pilih tipe barang!',
            }),
            desc: z.string().optional(),
            year: z.preprocess(
                (value) => {
                    if (value === '') return undefined; // Treat empty strings as undefined
                    return Number(value); // Coerce other inputs to numbers
                },
                z
                    .number({
                        required_error: 'Tahun tidak boleh kosong!', // Custom error for undefined
                        invalid_type_error:
                            'Tahun harus berupa angka & tidak boleh kosong!',
                    })
                    .int({ message: 'Tahun harus berupa angka bulat!' })
                    .min(1900, {
                        message: 'Tahun tidak boleh kurang dari 1900!',
                    })
                    .max(new Date().getFullYear(), {
                        message: `Tahun tidak boleh lebih dari ${new Date().getFullYear()}!`,
                    }),
            ),
            value: z.coerce
                .number()
                .min(0, { message: 'Nilai barang tidak boleh negatif' })
                .max(1_000_000_000_000_000, {
                    message: 'Nilai tidak boleh melebih 1 trilyun!',
                }),
            brand: z.string().nonempty({
                message: 'Masukkan merek barang!',
            }),
            serial: z.string().nonempty({ message: 'Masukkan serial barang!' }),
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
        })
        .superRefine((data, ctx) => {
            // Validasi khusus hanya jika type = KENDARAAN
            if (data.type === 'KENDARAAN') {
                const parts = data.serial.split('-');

                // Validasi jumlah bagian
                if (parts.length !== 3) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message:
                            'Format harus XX-0000-XXX (contoh: AB-1234-DEF)',
                        path: ['serial'], // Tunjukkan error ke field serial
                    });
                    return;
                }

                const [part1, part2, part3] = parts;

                // Validasi part1 (maks 2 huruf)
                if (part1.length > 2 || !/^[A-Za-z]+$/.test(part1)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Bagian pertama maksimal 2 huruf!',
                        path: ['serial'],
                    });
                }

                // Validasi part2 (maks 4 angka)
                if (part2.length > 4 || !/^\d+$/.test(part2)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Bagian kedua maksimal 4 angka!',
                        path: ['serial'],
                    });
                }

                // Validasi part3 (maks 3 huruf)
                if (part3.length > 3 || !/^[A-Za-z]+$/.test(part3)) {
                    ctx.addIssue({
                        code: z.ZodIssueCode.custom,
                        message: 'Bagian ketiga maksimal 3 huruf!',
                        path: ['serial'],
                    });
                }
            }
        })
        .refine(
            async (data) => {
                // Validasi keunikan serial (hanya jika type = KENDARAAN)
                if (data.type === 'KENDARAAN') {
                    const res = await fetch('/api/items/check-serial', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ serial: data.serial, itemId }),
                    });
                    const { isUnique } = await res.json();
                    return isUnique;
                }
                return true;
            },
            {
                message: 'Serial barang sudah pernah terdaftar!',
                path: ['serial'], // Tunjukkan error ke field serial
            },
        );
    const form = useForm<z.infer<typeof itemSchema>>({
        resolver: zodResolver(itemSchema),
        defaultValues: {
            name: '',
            type: 'KENDARAAN',
            desc: '',
            year: new Date().getFullYear(),
            serial: '',
            value: 0,
            brand: '',
            image: [],
        },
        mode: 'onBlur',
        shouldFocusError: true,
    });
    const router = useRouter();
    const [item, setItem] = React.useState<Item | null>(null);
    const [isPending, setIsPending] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [documentData, setDocumentData] = React.useState({
        initialDocuments: [] as ItemDocument[],
        newDocuments: [] as ItemDocument[],
        editedDocuments: [] as ItemDocument[],
        deletedDocuments: [] as ItemDocument[],
    });

    const handleDocumentsChange = React.useCallback(
        (updatedData: {
            newDocuments: ItemDocument[];
            editedDocuments: ItemDocument[];
            deletedDocuments: ItemDocument[];
        }) => {
            setDocumentData((prev) => ({
                ...prev,
                ...updatedData,
            }));
        },
        [],
    );
    React.useEffect(() => {
        if (params.itemId) {
            const fetchItem = async () => {
                try {
                    const response = await fetch(`/api/items/${params.itemId}`);
                    if (response.ok) {
                        const data = await response.json();
                        setItem(data);
                        form.setValue('name', data.name);
                        form.setValue('type', data.type);
                        form.setValue('serial', data.serial);
                        form.setValue('desc', data.desc || '');
                        form.setValue('year', data.year);
                        form.setValue('brand', data.brand);
                        form.setValue('value', data.value);
                        const initialDocuments = data.itemDocuments.map(
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
                        console.error('Failed to fetch item data');
                        return (
                            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                                <TriangleAlert
                                    size={32}
                                    className="text-destructive"
                                />
                                <span className="text-md text-destructive font-medium">
                                    Data Barang Tidak Ditemukan !
                                </span>
                            </div>
                        );
                    }
                } catch (error) {
                    console.error('Error fetching item:', error);
                }
            };
            fetchItem();
        }
    }, [params.itemId, form]);
    if (loading) {
        return (
            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                <SpokeSpinner size="md" />
                <span className="text-md font-medium text-muted-foreground">
                    Memuat data barang...
                </span>
            </div>
        );
    }

    const onSubmit = async (values: z.infer<typeof itemSchema>) => {
        setIsPending(true); // Set loading state to true
        try {
            const method = 'PUT';
            const url = `/api/items/${params.itemId}`;
            const itemResponse = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!itemResponse.ok) {
                const errorMessage = await itemResponse.text();
                console.error(errorMessage);
                throw new Error('Failed to save item data');
            }
            const { item } = await itemResponse.json();
            const itemId = item.id;

            // Item Documents
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
                    '/api/item-documents/upload',
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
                const docResponse = await fetch('/api/item-documents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        item_id: itemId,
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
                    '/api/item-documents/upload',
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
                    `/api/item-documents/${editedDoc.id}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: editedDoc.name,
                            doc_url: publicUrl,
                            itemId: itemId,
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
                    `/api/item-documents/${deletedDoc.id}`,
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

            router.push(`/dashboard/barang/${params.itemId}`);
            toast.success('Data barang berhasil diubah!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Data barang gagal diubah!');
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
                            Ubah Data Barang {item?.name}
                        </CardTitle>
                        <Link
                            href={`/dashboard/barang/${item?.id}`}
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
                                        <FormLabel>Nama Barang</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Masukkan nama barang"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nilai Barang</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                    Rp.
                                                </span>
                                                <Input
                                                    type="text"
                                                    className="pl-10"
                                                    {...field}
                                                    value={
                                                        field.value
                                                            ? formatCurrency(
                                                                  field.value,
                                                              )
                                                            : ''
                                                    }
                                                    onChange={(e) => {
                                                        const parsedValue =
                                                            parseCurrency(
                                                                e.target.value,
                                                            );
                                                        field.onChange(
                                                            parsedValue,
                                                        );
                                                    }}
                                                    onFocus={(e) => {
                                                        const currentValue =
                                                            field.value || 0;
                                                        e.target.value =
                                                            currentValue.toString();
                                                    }}
                                                    onBlur={(e) => {
                                                        if (field.value) {
                                                            e.target.value =
                                                                formatCurrency(
                                                                    field.value,
                                                                );
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-6">
                                <FormField
                                    control={form.control}
                                    name="serial"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Serial/NoPol</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Masukkan Serial/NoPol"
                                                    {...field}
                                                    value={field.value || ''}
                                                    onChange={(e) => {
                                                        const type =
                                                            form.watch('type'); // Get type
                                                        const rawValue =
                                                            e.target.value;

                                                        if (
                                                            type === 'KENDARAAN'
                                                        ) {
                                                            const cleanedValue =
                                                                rawValue.replace(
                                                                    /-/g,
                                                                    '',
                                                                );
                                                            let part1 = '';
                                                            let part2 = '';
                                                            let part3 = '';
                                                            let currentPart:
                                                                | 'part1'
                                                                | 'part2'
                                                                | 'part3' =
                                                                'part1';

                                                            for (const char of cleanedValue) {
                                                                if (
                                                                    currentPart ===
                                                                    'part1'
                                                                ) {
                                                                    if (
                                                                        /^[A-Za-z]$/.test(
                                                                            char,
                                                                        ) &&
                                                                        part1.length <
                                                                            2
                                                                    ) {
                                                                        part1 +=
                                                                            char.toUpperCase();
                                                                    } else if (
                                                                        /^\d$/.test(
                                                                            char,
                                                                        ) &&
                                                                        part1.length >
                                                                            0
                                                                    ) {
                                                                        currentPart =
                                                                            'part2';
                                                                        part2 +=
                                                                            char;
                                                                    }
                                                                } else if (
                                                                    currentPart ===
                                                                    'part2'
                                                                ) {
                                                                    if (
                                                                        /^\d$/.test(
                                                                            char,
                                                                        ) &&
                                                                        part2.length <
                                                                            4
                                                                    ) {
                                                                        part2 +=
                                                                            char;
                                                                    } else if (
                                                                        /^[A-Za-z]$/.test(
                                                                            char,
                                                                        ) &&
                                                                        part2.length >
                                                                            0
                                                                    ) {
                                                                        currentPart =
                                                                            'part3';
                                                                        part3 +=
                                                                            char.toUpperCase();
                                                                    }
                                                                } else if (
                                                                    currentPart ===
                                                                    'part3'
                                                                ) {
                                                                    if (
                                                                        /^[A-Za-z]$/.test(
                                                                            char,
                                                                        ) &&
                                                                        part3.length <
                                                                            3
                                                                    ) {
                                                                        part3 +=
                                                                            char.toUpperCase();
                                                                    }
                                                                }
                                                            }

                                                            // Format the value
                                                            const formatted = [
                                                                part1,
                                                                part2,
                                                                part3,
                                                            ]
                                                                .filter(Boolean)
                                                                .join('-');

                                                            form.setValue(
                                                                'serial',
                                                                formatted,
                                                                {
                                                                    shouldValidate:
                                                                        true,
                                                                },
                                                            );
                                                        } else {
                                                            // For OTHER types, allow free input
                                                            form.setValue(
                                                                'serial',
                                                                rawValue,
                                                                {
                                                                    shouldValidate:
                                                                        true,
                                                                },
                                                            );
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="type"
                                    render={({ field }) => (
                                        <FormItem className="space-y-3">
                                            <FormLabel>Tipe Barang</FormLabel>
                                            <FormControl>
                                                <RadioGroup
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    value={field.value}
                                                    className="flex flex-col sm:flex-row gap-2"
                                                >
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <RadioGroupItem value="KENDARAAN" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Kendaraan
                                                        </FormLabel>
                                                    </FormItem>
                                                    <FormItem className="flex items-center space-x-2">
                                                        <FormControl>
                                                            <RadioGroupItem value="OTHER" />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            Lainnya
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
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tahun Barang</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="Tahun Barang"
                                                {...field}
                                                value={field.value || ''}
                                                onChange={(e) => {
                                                    const newValue = e.target
                                                        .value
                                                        ? parseInt(
                                                              e.target.value,
                                                              10,
                                                          )
                                                        : '';
                                                    field.onChange(newValue); // Ensure it's treated as a number
                                                }}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Merk</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Merk Barang"
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
                                        <FormLabel>Deskripsi Barang</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Masukkan deskripsi barang"
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
                                        dataName={`Barang ${item?.name}`}
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
