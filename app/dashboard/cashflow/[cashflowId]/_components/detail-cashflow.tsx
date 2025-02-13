'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { SpokeSpinner } from '@/components/ui/spinner';
import {
    TriangleAlert,
    Pencil,
    ArrowLeft,
    Download,
} from 'lucide-react';
import Link from 'next/link';
import { formatDate, formatToIndonesianCurrency } from '@/lib/utils';
import { getDeadlineInfo } from '@/lib/deadline';
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
    amount: any;
    payment_type: 'CASH' | 'BNI' | 'BSI';
    waktu_bayar: string;
    desc?: string;
    transaction: Transaction;
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
    cashflowId: number;
    name: string;
    doc_type: string;
    doc_url: string;
};

export default function CashflowDetailPage({
    params,
}: {
    params: { cashflowId: string };
}) {
    const [cashflow, setCashflow] = useState<CashFlow | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // const router = useRouter();

    useEffect(() => {
        const fetchCashflow = async () => {
            try {
                const response = await fetch(
                    `/api/cashflows/${params.cashflowId}`,
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch cashflow data');
                }
                const data = await response.json();
                console.log(data);
                setCashflow(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCashflow();
    }, [params.cashflowId]);
    if (loading) {
        return (
            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                <SpokeSpinner size="md" />
                <span className="text-md font-medium text-muted-foreground">
                    Memuat data cashflow...
                </span>
            </div>
        );
    }
    if (!cashflow) {
        return (
            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                <TriangleAlert size={32} className="text-destructive" />
                <span className="text-md text-destructive font-medium">
                    Data Cashflow Tidak Ditemukan !
                </span>
            </div>
        );
    }
    return (
        <Card className="mx-auto w-full">
            <div className="m-3 flex space-x-2 justify-between">
                <Link
                    href="/dashboard/cashflow"
                    className={buttonVariants({ variant: 'outline' })}
                >
                    <ArrowLeft />
                    {' Kembali'}
                </Link>
                <Link
                    href={`/dashboard/cashflow/${cashflow.id}/ubah`}
                    className={buttonVariants({ variant: 'outline' })}
                >
                    {'Ubah '}
                    <Pencil />
                </Link>
            </div>
            <CardHeader className="flex flex-row items-center justify-between mb-4 border">
                <CardTitle className="text-left text-2xl font-bold">
                    Data Cashflow Transaksi{' '}
                    {formatDate(cashflow.transaction.waktu_pinjam.toString())}
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
                            Transaksi
                        </div>
                        <div className="py-2 col-span-2">
                            :{' '}
                            {formatDate(
                                cashflow.transaction.waktu_pinjam.toString(),
                            )}{' '}
                            <Link
                                className="text-blue-500"
                                href={`/dashboard/cashflow/${cashflow.id}/transaksi`}
                            >
                                [Detail]
                            </Link>
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Termin ke-
                        </div>
                        <div className="py-2 col-span-2">
                            : {cashflow.termin}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Nilai
                        </div>
                        <div className="py-2 col-span-2">
                            : {formatToIndonesianCurrency(cashflow.amount)}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Tipe Bayar
                        </div>
                        <div className="py-2 col-span-2">
                            : {cashflow.payment_type}
                        </div>
                    </div>
                    {/* <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Waktu Bayar
                        </div>
                        <div className="py-2 col-span-2">
                            : {formatDate(cashflow.waktu_bayar)}
                        </div>
                    </div> */}

                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Waktu Bayar
                        </div>
                        <div className="py-2 col-span-2">
                            <div className="flex items-center whitespace-nowrap overflow-hidden">
                                {': '}
                                <span
                                    className={`mx-2 font-bold flex-shrink-0 ${getDeadlineInfo(cashflow.transaction.tgl_jatuh_tempo, cashflow.waktu_bayar).textColor}`}
                                >
                                    {
                                        getDeadlineInfo(
                                            cashflow.transaction
                                                .tgl_jatuh_tempo,
                                            cashflow.waktu_bayar,
                                        ).statusText
                                    }
                                </span>
                                <span className="overflow-hidden text-ellipsis flex-shrink">
                                    {formatDate(cashflow.waktu_bayar)}
                                </span>
                            </div>
                        </div>
                    </div>
                    {cashflow.desc && (
                        <div className="grid grid-cols-3">
                            <div className="py-2 font-semibold col-span-1">
                                Catatan
                            </div>
                            <div className="py-2 col-span-2">
                                : {cashflow.desc}
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Kuitansi
                        </div>
                        <div className="py-2 col-span-2 items-center">
                            <Button
                                className="flex flex-row"
                                variant={'outline'}
                                size={'sm'}
                            >
                                <Download className="mr-2" />
                                Unduh
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
