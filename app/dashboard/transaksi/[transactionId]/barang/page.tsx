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
import { cn, formatToIndonesianCurrency } from '@/lib/utils';
import ZoomableImage from '@/components/zoomable-image';
import PageContainer from '@/components/layout/page-container';

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
    desc?: string;
    year: number;
    value: any;
    brand: string;
    serial: string;
    itemDocuments: ItemDocument[];
    customer: Customer;
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

export default function ItemDetailPage({
    params,
}: {
    params: { transactionId: string };
}) {
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // const router = useRouter();

    useEffect(() => {
        const fetchItem = async () => {
            try {
                const transactionResponse = await fetch(
                    `/api/transactions/${params.transactionId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );
                if (!transactionResponse.ok) {
                    throw new Error('Failed to fetch transaction data');
                }
                const transactionData = await transactionResponse.json();
                const itemId = transactionData.item.id;
                const itemResponse = await fetch(`/api/items/${itemId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (!itemResponse.ok) {
                    throw new Error('Failed to fetch item');
                }
                const itemData = await itemResponse.json();
                setItem(itemData);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchItem();
    }, [params.transactionId]);
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
    if (!item) {
        return (
            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                <TriangleAlert size={32} className="text-destructive" />
                <span className="text-md text-destructive font-medium">
                    Data Barang Tidak Ditemukan !
                </span>
            </div>
        );
    }
    return (
        <PageContainer>
            <Card className="mx-auto w-full">
                <div className="m-3 flex space-x-2 justify-between">
                    <Link
                        href={`/dashboard/transaksi/${params.transactionId}`}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        <ArrowLeft />
                        {' Kembali'}
                    </Link>
                    <Link
                        href={`/dashboard/barang/${item.id}/ubah`}
                        className={buttonVariants({ variant: 'outline' })}
                    >
                        {'Ubah '}
                        <Pencil />
                    </Link>
                </div>
                <CardHeader className="flex flex-row items-center justify-between mb-4 border">
                    <CardTitle className="text-left text-2xl font-bold">
                        Data Barang {item.name}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid space-y-4">
                        <div className="grid grid-cols-3">
                            <div className="py-2 font-semibold col-span-1">
                                Nama
                            </div>
                            <div className="py-2 col-span-2">: {item.name}</div>
                        </div>
                        <div className="grid grid-cols-3">
                            <div className="py-2 font-semibold col-span-1">
                                Tipe
                            </div>
                            <div className="py-2 col-span-2">: {item.type}</div>
                        </div>
                        <div className="grid grid-cols-3">
                            <div className="py-2 font-semibold col-span-1">
                                Merk
                            </div>
                            <div className="py-2 col-span-2">
                                : {item.brand}
                            </div>
                        </div>
                        <div className="grid grid-cols-3">
                            <div className="py-2 font-semibold col-span-1">
                                Serial/NoPol
                            </div>
                            <div className="py-2 col-span-2">
                                : {item.serial}
                            </div>
                        </div>
                        <div className="grid grid-cols-3">
                            <div className="py-2 font-semibold col-span-1">
                                Tahun
                            </div>
                            <div className="py-2 col-span-2">: {item.year}</div>
                        </div>
                        <div className="grid grid-cols-3">
                            <div className="py-2 font-semibold col-span-1">
                                Nilai
                            </div>
                            <div className="py-2 col-span-2">
                                : {formatToIndonesianCurrency(item.value)}
                            </div>
                        </div>
                        <div className="grid grid-cols-3">
                            <div className="py-2 font-semibold col-span-1">
                                Pemilik
                            </div>
                            <div className="py-2 col-span-2">
                                : {item.customer.name}{' '}
                                <Link
                                    className="text-blue-500"
                                    href={`/dashboard/barang/${item.id}/pemilik`}
                                >
                                    [Detail]
                                </Link>
                            </div>
                        </div>
                        {item.desc && (
                            <div className="grid grid-cols-3">
                                <div className="py-2 font-semibold col-span-1">
                                    Catatan
                                </div>
                                <div className="py-2 col-span-2">
                                    : {item.desc}
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                {item.itemDocuments.length <= 0 ? (
                    ''
                ) : (
                    <div className="flex flex-col border-t-2 justify-center text-center items-center">
                        <CardHeader className="flex flex-row items-center justify-between mb-4">
                            <CardTitle className="text-center text-2xl font-bold">
                                Dokumen Barang {item.name}
                            </CardTitle>
                        </CardHeader>
                        <Carousel
                            opts={{
                                align: 'start',
                            }}
                            className="w-full max-w-sm md:max-w-xl lg:max-w-3xl mb-6"
                        >
                            <CarouselContent>
                                {item.itemDocuments.map((doc, index) => (
                                    <CarouselItem
                                        key={index}
                                        className={cn('', {
                                            'md:basis-1/2':
                                                item.itemDocuments.length === 2,
                                            'md:basis-1/3':
                                                item.itemDocuments.length > 2,
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
                                ))}
                            </CarouselContent>
                            <>
                                {/* Always render buttons on mobile, conditionally render on larger screens */}
                                <div
                                    className={cn('flex', {
                                        'md:hidden flex':
                                            item.itemDocuments.length <= 3,
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
        </PageContainer>
    );
}
