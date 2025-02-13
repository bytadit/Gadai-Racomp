'use client';
import * as React from 'react';
// import { useState, ChangeEvent, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Calendar, RefreshCw, SquarePen } from 'lucide-react';
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
// import DatePicker from '@/components/date-picker';
import { Textarea } from '@/components/ui/textarea';
import { TriangleAlert } from 'lucide-react';
// import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { formatCurrency, parseCurrency } from '@/lib/utils';
import { DocumentEditor } from '@/components/document-editor';
import { Toggle } from '@/components/ui/toggle';
import { DateTimePicker } from '@/components/date-time-picker';
import {
    calculateStatusCicilan,
    calculateStatusTransaksi,
} from '@/lib/transaction-helper';

type Transaction = {
    id: number;
    desc?: string;
    type: 'SIMPAN' | 'PAKAI';
    nilai_pinjaman: any;
    persen_tanggungan: any;
    waktu_pinjam: string;
    tgl_jatuh_tempo: string;
    tanggungan_awal: any;
    tanggungan_akhir: any;
    waktu_kembali: string;
    cashflows: CashFlow[];
    status_transaksi: 'BERJALAN' | 'SELESAI' | 'PERPANJANG';
    status_cicilan: 'AMAN' | 'BERMASALAH' | 'DIJUAL';
};

type CashFlow = {
    id: number;
    termin: number;
    desc?: string;
    amount: any;
    tanggungan: any;
    waktu_bayar: string;
    payment_type: 'CASH' | 'BNI' | 'BSI';
    kwitansi_url?: string;
    transaction: Transaction;
    transactionId: number;
};

type DocumentType = 'FOTO' | 'DOKUMEN';
type DocumentState = 'original' | 'new' | 'edited' | 'deleted';

type TransactionDocument = {
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

export default function EditTransactionForm({
    params,
}: {
    params: { transactionId: string };
}) {
    const transactionId = params.transactionId;
    const transactionSchema = z.object({
        nilai_pinjaman: z.coerce
            .number()
            .min(0, { message: 'Nilai pinjaman tidak boleh negatif' })
            .max(1_000_000_000_000_000, {
                message: 'Nilai pinjaman tidak boleh melebih 1 trilyun!',
            }),
        persen_tanggungan: z.coerce // auto generate % from nilai pinjaman (5% * pinjaman)
            .number()
            .min(0, { message: 'Persentase tanggungan tidak boleh negatif' })
            .max(1_000_000_000_000_000, {
                message: 'Persentase tanggungan tidak boleh melebih 1 trilyun!',
            }),
        waktu_pinjam: z.preprocess(
            (arg) => {
                // If the input is a string, try to convert it to a Date.
                if (typeof arg === 'string' || arg instanceof Date) {
                    return new Date(arg);
                }
                return arg;
            },
            z.date({
                required_error: 'Masukkan waktu peminjaman/gadai!',
            }),
        ),
        type: z.enum(['SIMPAN', 'PAKAI'], {
            required_error: 'Pilih tipe transaksi!',
        }),
        duration: z.number({
            //brp bulan
            required_error: 'Durasi tidak boleh kosong!',
        }),
        tgl_jatuh_tempo: z.preprocess(
            (arg) => {
                if (typeof arg === 'string' || arg instanceof Date) {
                    return new Date(arg);
                }
                return arg;
            },
            z.date({
                required_error: 'Masukkan waktu jatuh tempo!',
            }),
        ),
        tanggungan_awal: z.coerce // auto generate (NilaiPinjaman + (persen tanggungan * durasi(bulan))
            .number()
            .min(0, { message: 'Nilai tanggungan awal tidak boleh negatif' })
            .max(1_000_000_000_000_000, {
                message: 'Nilai tanggungan awal tidak boleh melebih 1 trilyun!',
            }),
        tanggungan_akhir: z.coerce // auto generate (NilaiPinjaman + (persen tanggungan * durasi(bulan))
            .number()
            .min(0, { message: 'Nilai tanggungan akhir tidak boleh negatif' })
            .max(1_000_000_000_000_000, {
                message:
                    'Nilai tanggungan akhir tidak boleh melebih 1 trilyun!',
            }),
        waktu_kembali: z.preprocess(
            (arg) => {
                // If the input is a string, try to convert it to a Date.
                if (typeof arg === 'string' || arg instanceof Date) {
                    return new Date(arg);
                }
                return arg;
            },
            z.date({
                required_error: 'Masukkan waktu pengembalian barang!',
            }),
        ),
        status_transaksi: z.enum(['BERJALAN', 'SELESAI', 'PERPANJANG'], {
            required_error: 'Pilih status transaksi!',
        }),
        status_cicilan: z.enum(['AMAN', 'BERMASALAH', 'DIJUAL'], {
            required_error: 'Pilih status transaksi!',
        }),
        desc: z.string().optional(),
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
    const form = useForm<z.infer<typeof transactionSchema>>({
        resolver: zodResolver(transactionSchema),
        defaultValues: {
            nilai_pinjaman: 0,
            persen_tanggungan: 0,
            waktu_pinjam: new Date(),
            type: 'PAKAI',
            duration: 1,
            tgl_jatuh_tempo: (() => {
                const d = new Date();
                d.setMonth(d.getMonth() + 1);
                return d;
            })(),
            waktu_kembali: new Date(),
            status_transaksi: 'BERJALAN',
            status_cicilan: 'AMAN',
            tanggungan_awal: 0,
            tanggungan_akhir: 0,
            desc: '',
            image: [],
        },
        mode: 'onBlur',
        shouldFocusError: true,
    });
    const router = useRouter();
    const [transaction, setTransaction] = React.useState<Transaction | null>(
        null,
    );
    const [isPending, setIsPending] = React.useState(false);
    const [loading, setLoading] = React.useState(true);
    const [documentData, setDocumentData] = React.useState({
        initialDocuments: [] as TransactionDocument[],
        newDocuments: [] as TransactionDocument[],
        editedDocuments: [] as TransactionDocument[],
        deletedDocuments: [] as TransactionDocument[],
    });

    const handleDocumentsChange = React.useCallback(
        (updatedData: {
            newDocuments: TransactionDocument[];
            editedDocuments: TransactionDocument[];
            deletedDocuments: TransactionDocument[];
        }) => {
            setDocumentData((prev) => ({
                ...prev,
                ...updatedData,
            }));
        },
        [],
    );
    // Local state for toggle overrides
    const [isOverrideJatuhTempo, setIsOverrideJatuhTempo] =
        React.useState<boolean>(() => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('jatuhTempoOverride');
                return saved !== null ? saved === 'true' : false;
            }
            return false;
        });
    const [isOverride, setIsOverride] = React.useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('percentOverride');
            return saved !== null ? saved === 'true' : true;
        }
        return true;
    });
    const [waktuPinjamNow, setWaktuPinjamNow] = React.useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('waktuPinjamNow');
            return saved !== null ? saved === 'true' : true;
        }
        return true;
    });

    React.useEffect(() => {
        if (params.transactionId) {
            const fetchTransaction = async () => {
                try {
                    const response = await fetch(
                        `/api/transactions/${params.transactionId}`,
                    );
                    if (response.ok) {
                        const data = await response.json();
                        setTransaction(data);
                        const statusTransaksi = calculateStatusTransaksi({
                            status_transaksi: data.status_transaksi,
                            tgl_jatuh_tempo: data.tgl_jatuh_tempo,
                        }) as 'BERJALAN' | 'SELESAI' | 'PERPANJANG';
                        const statusCicilan = calculateStatusCicilan({
                            status_cicilan: data.status_cicilan,
                            tgl_jatuh_tempo: data.tgl_jatuh_tempo,
                            cashflows: data.cashflows, // replace [] with actual cashflow data if available
                        }) as 'AMAN' | 'BERMASALAH' | 'DIJUAL';
                        form.setValue('nilai_pinjaman', data.nilai_pinjaman);
                        form.setValue(
                            'persen_tanggungan',
                            data.persen_tanggungan,
                        );
                        form.setValue('waktu_pinjam', data.waktu_pinjam);
                        form.setValue('type', data.type || 'SIMPAN');
                        const durationMonths =
                            data.duration ||
                            Math.max(
                                1,
                                new Date(data.tgl_jatuh_tempo).getMonth() -
                                    new Date(data.waktu_pinjam).getMonth(),
                            );
                        form.setValue('duration', durationMonths);
                        form.setValue('tgl_jatuh_tempo', data.tgl_jatuh_tempo);
                        form.setValue('tanggungan_awal', data.tanggungan_awal);
                        form.setValue('status_transaksi', statusTransaksi);
                        form.setValue('status_cicilan', statusCicilan);
                        const initialDocuments = data.transactionDocuments.map(
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
                        console.error('Failed to fetch transaction data');
                        return (
                            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                                <TriangleAlert
                                    size={32}
                                    className="text-destructive"
                                />
                                <span className="text-md text-destructive font-medium">
                                    Data Transaksi Tidak Ditemukan !
                                </span>
                            </div>
                        );
                    }
                } catch (error) {
                    console.error('Error fetching transaction data:', error);
                }
            };
            fetchTransaction();
        }
    }, [params.transactionId, form]);
    // Watch fields for recalculation
    // --- Watch necessary fields
    const nilai_pinjaman = Number(form.watch('nilai_pinjaman')) || 0;
    const persen_tanggungan = Number(form.watch('persen_tanggungan')) || 0;
    const tanggungan_awal = Number(form.watch('tanggungan_awal')) || 0;
    const tgl_jatuh_tempo = form.watch('tgl_jatuh_tempo');
    const now = new Date();
    const waktu_pinjam = form.watch('waktu_pinjam');
    const duration = form.watch('duration');
    // Initialize defaults if needed.
    React.useEffect(() => {
        if (!form.watch('waktu_pinjam')) {
            form.setValue('waktu_pinjam', new Date());
        }
        if (!form.watch('type')) {
            form.setValue('type', 'PAKAI');
        }
    }, []);
    // --- Jatuh Tempo override ---
    React.useEffect(() => {
        localStorage.setItem(
            'jatuhTempoOverride',
            isOverrideJatuhTempo.toString(),
        );
        if (!isOverrideJatuhTempo) {
            const dur = duration || 1;
            // Use the selected waktu_pinjam as the start date
            const startDate = new Date(waktu_pinjam);
            startDate.setMonth(startDate.getMonth() + dur);
            form.setValue('tgl_jatuh_tempo', startDate);
        }
    }, [duration, waktu_pinjam, isOverrideJatuhTempo, form]);

    React.useEffect(() => {
        const statusTransaksi = calculateStatusTransaksi({
            status_transaksi: transaction?.status_transaksi,
            tgl_jatuh_tempo: tgl_jatuh_tempo,
        }) as 'BERJALAN' | 'SELESAI' | 'PERPANJANG';
        const statusCicilan = calculateStatusCicilan({
            status_cicilan: transaction?.status_cicilan,
            tgl_jatuh_tempo: tgl_jatuh_tempo,
            cashflows: transaction?.cashflows ?? [],
        }) as 'AMAN' | 'BERMASALAH' | 'DIJUAL';
        form.setValue('status_transaksi', statusTransaksi);
        form.setValue('status_cicilan', statusCicilan);
    }, [tgl_jatuh_tempo, transaction, form]);
    // --- New local state for toggles
    // When true, the user manually overrides tanggungan_akhir.
    const [isOverrideTanggunganAkhir, setIsOverrideTanggunganAkhir] =
        React.useState<boolean>(() => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('overrideTanggunganAkhir');
                return saved !== null ? saved === 'true' : false;
            }
            return false;
        });
    // When true, waktu_kembali will be forced to “now”
    const [waktuKembaliNow, setWaktuKembaliNow] = React.useState<boolean>(
        () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('waktuKembaliNow');
                return saved !== null ? saved === 'true' : true;
            }
            return true;
        },
    );

    // --- Persen Tanggungan override ---
    React.useEffect(() => {
        localStorage.setItem('percentOverride', isOverride.toString());
        if (!isOverride) {
            const nilai = nilai_pinjaman || 0;
            const computedPersen = nilai * 0.05;
            form.setValue('persen_tanggungan', computedPersen);
        }
    }, [nilai_pinjaman, isOverride, form]);

    // --- Waktu Peminjaman "Now" toggle ---
    React.useEffect(() => {
        localStorage.setItem('waktuPinjamNow', waktuPinjamNow.toString());
        if (waktuPinjamNow) {
            form.setValue('waktu_pinjam', new Date());
        }
    }, [waktuPinjamNow, form]);

    // --- Compute Tanggungan Awal ---
    // --- Effect to auto-calculate tanggungan_akhir (if not overridden)
    React.useEffect(() => {
        localStorage.setItem(
            'overrideTanggunganAkhir',
            isOverrideTanggunganAkhir.toString(),
        );
        if (!isOverrideTanggunganAkhir) {
            // Ensure we have a valid due date (tgl_jatuh_tempo)
            const dueDate = new Date(tgl_jatuh_tempo);
            let newTanggunganAkhir = tanggungan_awal;

            if (dueDate > now) {
                // If the due date is in the future, default is tanggungan_awal.
                newTanggunganAkhir = tanggungan_awal;
            } else {
                // Calculate the difference in days.
                const diffTime = Math.abs(now.getTime() - dueDate.getTime());
                const diffDays = diffTime / (1000 * 60 * 60 * 24);

                if (diffDays <= 10) {
                    // If within 10 days, add one unit of persen_tanggungan.
                    newTanggunganAkhir = tanggungan_awal + persen_tanggungan;
                } else {
                    // Otherwise, calculate the month difference between now and dueDate.
                    const yearDiff = now.getFullYear() - dueDate.getFullYear();
                    const monthDiff =
                        now.getMonth() - dueDate.getMonth() + yearDiff * 12;
                    // Here we assume “10% * nilai_pinjaman” per month.
                    newTanggunganAkhir =
                        tanggungan_awal + monthDiff * 0.1 * nilai_pinjaman;
                }
            }
            form.setValue('tanggungan_akhir', newTanggunganAkhir);
            localStorage.setItem(
                'tanggungan_akhir',
                newTanggunganAkhir.toString(),
            );
        }
        // We include the watched values in the dependency array.
    }, [
        tanggungan_awal,
        persen_tanggungan,
        nilai_pinjaman,
        tgl_jatuh_tempo,
        isOverrideTanggunganAkhir,
        form,
    ]);

    // --- Effect to auto-calculate waktu_kembali (if the “now” toggle is active)
    React.useEffect(() => {
        localStorage.setItem('waktuKembaliNow', waktuKembaliNow.toString());
        if (waktuKembaliNow) {
            const dueDate = new Date(tgl_jatuh_tempo);
            // If now is earlier than the due date, default to due date; otherwise, use now.
            if (now < dueDate) {
                form.setValue('waktu_kembali', dueDate);
            } else {
                form.setValue('waktu_kembali', now);
            }
        }
    }, [tgl_jatuh_tempo, waktuKembaliNow, form, now]);
    React.useEffect(() => {
        const nilai = Number(nilai_pinjaman) || 0;
        const persen = Number(persen_tanggungan) || 0;
        const dur = Number(duration) || 1;
        const tanggunganAwal = nilai + dur * persen;
        form.setValue('tanggungan_awal', tanggunganAwal);
        localStorage.setItem('tanggungan_awal', tanggunganAwal.toString());
    }, [nilai_pinjaman, persen_tanggungan, duration, form]);

    if (loading) {
        return (
            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                <SpokeSpinner size="md" />
                <span className="text-md font-medium text-muted-foreground">
                    Memuat data transaksi...
                </span>
            </div>
        );
    }

    const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
        setIsPending(true); // Set loading state to true
        try {
            const method = 'PUT';
            const url = `/api/transactions/${params.transactionId}`;
            const transactionResponse = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!transactionResponse.ok) {
                const errorMessage = await transactionResponse.text();
                console.error(errorMessage);
                throw new Error('Failed to save transaction data');
            }
            const { transaction } = await transactionResponse.json();
            const transactionId = transaction.id;

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
                    '/api/transaction-documents/upload',
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
                const docResponse = await fetch('/api/transaction-documents', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        transaction_id: transactionId,
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
                    '/api/transaction-documents/upload',
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
                    `/api/transaction-documents/${editedDoc.id}`,
                    {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: editedDoc.name,
                            doc_url: publicUrl,
                            transactionId: transactionId,
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
                    `/api/transaction-documents/${deletedDoc.id}`,
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

            router.push(`/dashboard/transaksi/${params.transactionId}`);
            toast.success('Data transaksi berhasil diubah!');
        } catch (error) {
            console.error('Error:', error);
            toast.error('Data transaksi gagal diubah!');
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
                            Ubah Data Transaksi
                        </CardTitle>
                        <Link
                            href={`/dashboard/transaksi/${transaction?.id}`}
                            className={buttonVariants({ variant: 'outline' })}
                        >
                            <ArrowLeft />
                            {/* {' Kembali'} */}
                        </Link>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Nilai Pinjaman */}
                            <FormField
                                control={form.control}
                                name="nilai_pinjaman"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Nilai Pinjaman</FormLabel>
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
                            {/* Persen Tanggungan */}
                            <FormField
                                control={form.control}
                                name="persen_tanggungan"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Persen Tanggungan</FormLabel>
                                        <div className="flex items-center gap-1">
                                            <FormControl>
                                                <div className="relative w-full">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        Rp.
                                                    </span>
                                                    <Input
                                                        type="text"
                                                        className={`pl-10 ${!isOverride ? 'text-muted-foreground' : ''}`}
                                                        readOnly={!isOverride}
                                                        {...field}
                                                        value={
                                                            field.value
                                                                ? formatCurrency(
                                                                      field.value,
                                                                  )
                                                                : ''
                                                        }
                                                        onChange={(e) => {
                                                            if (isOverride) {
                                                                const parsedValue =
                                                                    parseCurrency(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                field.onChange(
                                                                    parsedValue,
                                                                );
                                                            }
                                                        }}
                                                        onFocus={(e) => {
                                                            if (isOverride) {
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
                                                onPressedChange={(pressed) =>
                                                    setIsOverride(pressed)
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
                            {/* Durasi Pinjam (bulan) */}
                            <FormField
                                control={form.control}
                                name="duration"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>
                                            Durasi Pinjam (bulan)
                                        </FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                value={field.value}
                                                onChange={(e) =>
                                                    field.onChange(
                                                        Number(e.target.value),
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Jatuh Tempo */}
                            <FormField
                                control={form.control}
                                name="tgl_jatuh_tempo"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Jatuh Tempo</FormLabel>
                                        <div className="flex items-center gap-1">
                                            <FormControl>
                                                <DateTimePicker
                                                    selectedDate={field.value}
                                                    setSelectedDate={(date) => {
                                                        field.onChange(date);
                                                        setIsOverrideJatuhTempo(
                                                            true,
                                                        );
                                                    }}
                                                    isDisabled={
                                                        !isOverrideJatuhTempo
                                                    }
                                                />
                                            </FormControl>
                                            <Toggle
                                                variant="outline"
                                                id="override-jatuh-tempo"
                                                pressed={isOverrideJatuhTempo}
                                                onPressedChange={(pressed) => {
                                                    setIsOverrideJatuhTempo(
                                                        pressed,
                                                    );
                                                    if (!pressed) {
                                                        const dur =
                                                            duration || 1;
                                                        const newDate =
                                                            new Date();
                                                        newDate.setMonth(
                                                            newDate.getMonth() +
                                                                dur,
                                                        );
                                                        field.onChange(newDate);
                                                    }
                                                }}
                                                className="ml-2"
                                            >
                                                <Calendar className="h-4 w-4" />
                                            </Toggle>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Waktu Peminjaman */}
                            <FormField
                                control={form.control}
                                name="waktu_pinjam"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Waktu Peminjaman</FormLabel>
                                        <div className="flex items-center gap-1">
                                            <FormControl>
                                                <DateTimePicker
                                                    isDisabled={false}
                                                    selectedDate={
                                                        field.value ||
                                                        new Date()
                                                    }
                                                    setSelectedDate={(date) => {
                                                        field.onChange(date);
                                                        setWaktuPinjamNow(
                                                            false,
                                                        );
                                                    }}
                                                />
                                            </FormControl>
                                            <Toggle
                                                variant="outline"
                                                pressed={waktuPinjamNow}
                                                onPressedChange={(pressed) => {
                                                    setWaktuPinjamNow(pressed);
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
                            {/* Waktu Kembali */}
                            <FormField
                                control={form.control}
                                name="waktu_kembali"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Waktu Kembali</FormLabel>
                                        <div className="flex items-center gap-1">
                                            <FormControl>
                                                <DateTimePicker
                                                    isDisabled={false}
                                                    selectedDate={
                                                        field.value ||
                                                        new Date()
                                                    }
                                                    setSelectedDate={(date) => {
                                                        field.onChange(date);
                                                        // When the user picks a date manually, disable the “now” toggle.
                                                        setWaktuKembaliNow(
                                                            false,
                                                        );
                                                    }}
                                                />
                                            </FormControl>
                                            <Toggle
                                                variant="outline"
                                                pressed={waktuKembaliNow}
                                                onPressedChange={(pressed) => {
                                                    setWaktuKembaliNow(pressed);
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

                            {/* Tanggungan Awal */}
                            <FormField
                                control={form.control}
                                name="tanggungan_awal"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Tanggungan Awal</FormLabel>
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                    Rp.
                                                </span>
                                                <Input
                                                    type="text"
                                                    className="pl-10 text-muted-foreground"
                                                    readOnly
                                                    {...field}
                                                    value={
                                                        field.value
                                                            ? formatCurrency(
                                                                  field.value,
                                                              )
                                                            : ''
                                                    }
                                                />
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* Tanggungan Akhir */}
                            <FormField
                                control={form.control}
                                name="tanggungan_akhir"
                                render={({ field }) => (
                                    <FormItem className="space-y-2">
                                        <FormLabel>Tanggungan Akhir</FormLabel>
                                        <div className="flex items-center gap-1">
                                            <FormControl>
                                                <div className="relative w-full">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        Rp.
                                                    </span>
                                                    <Input
                                                        type="text"
                                                        className={`pl-10 ${!isOverrideTanggunganAkhir ? 'text-muted-foreground' : ''}`}
                                                        readOnly={
                                                            !isOverrideTanggunganAkhir
                                                        }
                                                        {...field}
                                                        value={
                                                            field.value
                                                                ? formatCurrency(
                                                                      field.value,
                                                                  )
                                                                : ''
                                                        }
                                                        onChange={(e) => {
                                                            if (
                                                                isOverrideTanggunganAkhir
                                                            ) {
                                                                const parsedValue =
                                                                    parseCurrency(
                                                                        e.target
                                                                            .value,
                                                                    );
                                                                field.onChange(
                                                                    parsedValue,
                                                                );
                                                            }
                                                        }}
                                                        onFocus={(e) => {
                                                            if (
                                                                isOverrideTanggunganAkhir
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
                                                                isOverrideTanggunganAkhir &&
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
                                                id="override-tanggungan-akhir"
                                                pressed={
                                                    isOverrideTanggunganAkhir
                                                }
                                                onPressedChange={(pressed) =>
                                                    setIsOverrideTanggunganAkhir(
                                                        pressed,
                                                    )
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
                            {/* Status Transaksi */}
                            <FormField
                                control={form.control}
                                name="status_transaksi"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status Transaksi</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={true}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih status transaksi" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="BERJALAN">
                                                    Berjalan
                                                </SelectItem>
                                                <SelectItem value="SELESAI">
                                                    Selesai
                                                </SelectItem>
                                                <SelectItem value="PERPANJANG">
                                                    Perpanjang
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Status Cicilan */}
                            <FormField
                                control={form.control}
                                name="status_cicilan"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status Cicilan</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                            disabled={true}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Pilih status cicilan" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="AMAN">
                                                    Aman
                                                </SelectItem>
                                                <SelectItem value="BERMASALAH">
                                                    Bermasalah
                                                </SelectItem>
                                                <SelectItem value="DIJUAL">
                                                    Dijual
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem className="space-y-3">
                                        <FormLabel>Tipe Transaksi</FormLabel>
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={field.onChange}
                                                value={field.value}
                                                className="flex flex-col sm:flex-row gap-2"
                                            >
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <RadioGroupItem value="SIMPAN" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Simpan
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-2">
                                                    <FormControl>
                                                        <RadioGroupItem value="PAKAI" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        Pakai
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
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
                                        <FormLabel>Catatan Transaksi</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Masukkan catatan transaksi"
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
                                        dataName={`Barang ${transaction?.id}`}
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
