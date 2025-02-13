'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

import { AspectRatio } from '@/components/ui/aspect-ratio';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { buttonVariants } from '@/components/ui/button';
import { SpokeSpinner } from '@/components/ui/spinner';
import { TriangleAlert, Pencil, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn, formatDate, formatToIndonesianCurrency } from '@/lib/utils';
import ZoomableImage from '@/components/zoomable-image';
import { getDeadlineInfo } from '@/lib/deadline';
import { Badge } from '@/components/ui/badge';
import {
    calculateSisaTanggungan,
    calculateTanggunganAkhir,
} from '@/lib/transaction-helper';

type Customer = {
    id: number;
    name: string;
    nik: string;
    address: string;
    desc?: string;
    birthdate: string;
    gender: 'PRIA' | 'WANITA';
    customerPhones: CustomerPhone[];
    customerDocuments: CustomerDocument[];
};
type Item = {
    id: number;
    name: string;
    type: 'KENDARAAN' | 'OTHER';
    item_status: 'MASUK' | 'KELUAR' | 'DIJUAL';
    desc?: string;
    year: number;
    value: any;
    brand: string;
    serial: string;
    transactionDocuments: ItemDocument[];
    transactions: Transaction[];
    customer: Customer;
};

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
    status_transaksi: 'BERJALAN' | 'SELESAI' | 'PERPANJANG';
    status_cicilan: 'AMAN' | 'BERMASALAH' | 'DIJUAL';
    transactionDocuments: TransactionDocument[];
    cashflows: CashFlow[];
    item: Item;
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

type CustomerPhone = {
    id: number;
    customerId: number;
    phone_number: string;
    is_active: boolean;
    is_whatsapp: boolean;
};

type CustomerDocument = {
    id: number;
    customerId: number;
    name: string;
    doc_type: string;
    doc_url: string;
};

type ItemDocument = {
    id: number;
    itemId: number;
    name: string;
    doc_type: string;
    doc_url: string;
};
type TransactionDocument = {
    id: number;
    transactionId: number;
    name: string;
    doc_type: string;
    doc_url: string;
};

export default function TransactionDetailPage({
    params,
}: {
    params: { transactionId: string };
}) {
    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // const router = useRouter();

    useEffect(() => {
        const fetchTransaction = async () => {
            try {
                const response = await fetch(
                    `/api/transactions/${params.transactionId}`,
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch transaction data');
                }
                const data = await response.json();
                console.log(data);
                setTransaction(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransaction();
    }, [params.transactionId]);
    const tanggunganAkhir = calculateTanggunganAkhir({
        tanggungan_awal: transaction?.tanggungan_awal,
        tgl_jatuh_tempo: transaction?.tgl_jatuh_tempo ?? '',
        persen_tanggungan: transaction?.persen_tanggungan,
        nilai_pinjaman: transaction?.nilai_pinjaman,
    });
    const sisaTanggungan = calculateSisaTanggungan({
        transaction: {
            id: Number(params.transactionId),
            tanggungan_awal: transaction?.tanggungan_awal,
            tgl_jatuh_tempo: transaction?.tgl_jatuh_tempo ?? '',
            persen_tanggungan: transaction?.persen_tanggungan,
            nilai_pinjaman: transaction?.nilai_pinjaman,
        },
        cashflows:
            transaction?.cashflows?.map((cashflow) => ({
                transactionId: cashflow.transactionId,
                amount: cashflow.amount,
            })) ?? [], // Using the state variable which holds the fetched cashflows.
    });
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
    if (!transaction) {
        return (
            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                <TriangleAlert size={32} className="text-destructive" />
                <span className="text-md text-destructive font-medium">
                    Data Transaksi Tidak Ditemukan !
                </span>
            </div>
        );
    }
    return (
        <Card className="mx-auto w-full">
            <div className="m-3 flex space-x-2 justify-between">
                <Link
                    href="/dashboard/transaksi"
                    className={buttonVariants({ variant: 'outline' })}
                >
                    <ArrowLeft />
                    {' Kembali'}
                </Link>
                <Link
                    href={`/dashboard/transaksi/${transaction.id}/ubah`}
                    className={buttonVariants({ variant: 'outline' })}
                >
                    {'Ubah '}
                    <Pencil />
                </Link>
            </div>
            <CardHeader className="flex flex-row items-center justify-between mb-4 border">
                <CardTitle className="text-left text-2xl font-bold">
                    Data Transaksi Barang {transaction.item.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid space-y-4">
                    {/* <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Pelanggan
                        </div>
                        <div className="py-2 col-span-2">
                            : {transaction.item.customer.name}{' '}
                            <Link
                                className="text-blue-500"
                                href={`/dashboard/transaksi/${transaction.id}/pelanggan`}
                            >
                                [Detail]
                            </Link>
                        </div>
                    </div> */}
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Barang
                        </div>
                        <div className="py-2 col-span-2">
                            : {transaction.item.name}{' '}
                            <Link
                                className="text-blue-500"
                                href={`/dashboard/transaksi/${transaction.id}/barang`}
                            >
                                [Detail]
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Tipe
                        </div>
                        <div className="py-2 col-span-2">
                            : {transaction.type}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Nilai Pinjaman
                        </div>
                        <div className="py-2 col-span-2">
                            :{' '}
                            {formatToIndonesianCurrency(
                                transaction.nilai_pinjaman,
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            % Tanggungan
                        </div>
                        <div className="py-2 col-span-2">
                            :{' '}
                            {formatToIndonesianCurrency(
                                transaction.persen_tanggungan,
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Waktu Gadai
                        </div>
                        <div className="py-2 col-span-2">
                            : {formatDate(transaction.waktu_pinjam)}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Jatuh Tempo
                        </div>
                        <div className="py-2 col-span-2">
                            <div className="flex items-center whitespace-nowrap overflow-hidden">
                                {': '}
                                <span
                                    className={`mx-2 font-bold flex-shrink-0 ${getDeadlineInfo(transaction.tgl_jatuh_tempo).textColor}`}
                                >
                                    {
                                        getDeadlineInfo(
                                            transaction.tgl_jatuh_tempo,
                                        ).statusText
                                    }
                                </span>
                                <span className="overflow-hidden text-ellipsis flex-shrink">
                                    {formatDate(transaction.tgl_jatuh_tempo)}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Tanggungan Awal
                        </div>
                        <div className="py-2 col-span-2">
                            :{' '}
                            {formatToIndonesianCurrency(
                                transaction.tanggungan_awal,
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Tanggungan Akhir
                        </div>
                        <div className="py-2 col-span-2">
                            : {formatToIndonesianCurrency(tanggunganAkhir)}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Sisa Tanggungan
                        </div>
                        <div className="py-2 col-span-2">
                            : {formatToIndonesianCurrency(sisaTanggungan)}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Waktu Kembali
                        </div>
                        <div className="py-2 col-span-2">
                            : {formatDate(transaction.waktu_kembali)}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Status Transaksi
                        </div>
                        <div className="py-2 col-span-2">
                            :{' '}
                            <Badge variant={transaction.status_transaksi}>
                                {transaction.status_transaksi}
                            </Badge>
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Status Cicilan
                        </div>
                        <div className="py-2 col-span-2">
                            :{' '}
                            <Badge variant={transaction.status_cicilan}>
                                {transaction.status_cicilan}
                            </Badge>
                        </div>
                    </div>
                    {transaction.desc && (
                        <div className="grid grid-cols-3">
                            <div className="py-2 font-semibold col-span-1">
                                Catatan
                            </div>
                            <div className="py-2 col-span-2">
                                : {transaction.desc}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            {transaction.transactionDocuments.length <= 0 ? (
                ''
            ) : (
                <div className="flex flex-col border-t-2 justify-center text-center items-center">
                    <CardHeader className="flex flex-row items-center justify-between mb-4">
                        <CardTitle className="text-center text-2xl font-bold">
                            Dokumen Transaksi
                        </CardTitle>
                    </CardHeader>
                    <Carousel
                        opts={{
                            align: 'start',
                        }}
                        className="w-full max-w-sm md:max-w-xl lg:max-w-3xl mb-6"
                    >
                        <CarouselContent>
                            {transaction.transactionDocuments.map(
                                (doc, index) => (
                                    <CarouselItem
                                        key={index}
                                        className={cn('', {
                                            'md:basis-1/2':
                                                transaction.transactionDocuments
                                                    .length === 2,
                                            'md:basis-1/3':
                                                transaction.transactionDocuments
                                                    .length > 2,
                                        })}
                                    >
                                        <div className="p-1 relative">
                                            {' '}
                                            {/* Add relative to position ZoomableImage */}
                                            <Card>
                                                <CardContent className="flex aspect-square items-center justify-center p-6">
                                                    <AspectRatio className="bg-muted">
                                                        <Image
                                                            src={doc.doc_url}
                                                            alt={doc.name}
                                                            fill
                                                            className="h-full w-full rounded-md object-cover"
                                                        />
                                                    </AspectRatio>
                                                </CardContent>

                                                {/* Zoomable Image Button */}
                                                <div className="z-10 absolute top-4 right-4">
                                                    <ZoomableImage
                                                        src={doc.doc_url}
                                                        alt={doc.name}
                                                    />
                                                </div>
                                            </Card>
                                        </div>
                                    </CarouselItem>
                                ),
                            )}
                        </CarouselContent>
                        <>
                            {/* Always render buttons on mobile, conditionally render on larger screens */}
                            <div
                                className={cn('flex', {
                                    'md:hidden flex':
                                        transaction.transactionDocuments
                                            .length <= 3,
                                })}
                            >
                                <CarouselPrevious />
                                <CarouselNext />
                            </div>
                        </>
                    </Carousel>
                </div>
            )}
        </Card>
    );
}
