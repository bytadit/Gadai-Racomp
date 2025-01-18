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
import { TriangleAlert, Pencil, PhoneCall, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import ZoomableImage from '@/components/zoomable-image';

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

export default function CustomerDetailPage({
    params,
}: {
    params: { pelangganId: string };
}) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // const router = useRouter();

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const response = await fetch(
                    `/api/customers/${params.pelangganId}`,
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch customer');
                }
                const data = await response.json();
                console.log(data);
                setCustomer(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [params.pelangganId]);
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
    if (!customer) {
        return (
            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                <TriangleAlert size={32} className="text-destructive" />
                <span className="text-md text-destructive font-medium">
                    Data Pelanggan Tidak Ditemukan !
                </span>
            </div>
        );
    }
    return (
        <Card className="mx-auto w-full">
            <div className="m-3 flex space-x-2 justify-between">
                <Link
                    href="/dashboard/pelanggan"
                    className={buttonVariants({ variant: 'outline' })}
                >
                    <ArrowLeft />
                    {' Kembali'}
                </Link>
                <Link
                    href={`/dashboard/pelanggan/${customer.id}/ubah`}
                    className={buttonVariants({ variant: 'outline' })}
                >
                    {'Ubah '}
                    <Pencil />
                </Link>
            </div>
            <CardHeader className="flex flex-row items-center justify-between mb-4 border">
                <CardTitle className="text-left text-2xl font-bold">
                    Data Pelanggan {customer.name}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid space-y-4">
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Nama
                        </div>
                        <div className="py-2 col-span-2">: {customer.name}</div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">NIK</div>
                        <div className="py-2 col-span-2">: {customer.nik}</div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Alamat
                        </div>
                        <div className="py-2 col-span-2">
                            : {customer.address}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Tanggal Lahir
                        </div>
                        <div className="py-2 col-span-2">
                            :{' '}
                            {new Date(customer.birthdate).toLocaleDateString()}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Jenis Kelamin
                        </div>
                        <div className="py-2 col-span-2">
                            : {customer.gender}
                        </div>
                    </div>
                    <div className="grid grid-cols-3">
                        <div className="py-2 font-semibold col-span-1">
                            Nomor Telepon
                        </div>
                        <div className="py-2 col-span-2">
                            {customer.customerPhones.length <= 0 ? (
                                ': Nomor kosong'
                            ) : (
                                <ul
                                    style={{
                                        listStyleType: 'disc',
                                        marginLeft: '20px',
                                    }}
                                >
                                    {customer.customerPhones.map((phone) => (
                                        <li key={phone.id}>
                                            <div className="flex justify-between items-center">
                                                {phone.phone_number}
                                                {phone.is_active &&
                                                phone.is_whatsapp ? (
                                                    <Link
                                                        target="_blank"
                                                        href={`https://wa.me/${phone.phone_number}`}
                                                        className={cn(
                                                            buttonVariants({
                                                                variant:
                                                                    'outline',
                                                            }),
                                                        )}
                                                    >
                                                        <PhoneCall
                                                            size={2}
                                                            color={'green'}
                                                        />
                                                        {' WA'}
                                                    </Link>
                                                ) : (
                                                    ''
                                                )}
                                                {/* {phone.is_active
                                                    ? 'aktif'
                                                    : 'tidak aktif'} */}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                    {customer.desc && (
                        <div className="grid grid-cols-3">
                            <div className="py-2 font-semibold col-span-1">
                                Catatan
                            </div>
                            <div className="py-2 col-span-2">
                                : {customer.desc}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
            {customer.customerDocuments.length <= 0 ? (
                ''
            ) : (
                <div className="flex flex-col border-t-2 justify-center text-center items-center">
                    <CardHeader className="flex flex-row items-center justify-between mb-4">
                        <CardTitle className="text-center text-2xl font-bold">
                            Dokumen Pelanggan {customer.name}
                        </CardTitle>
                    </CardHeader>
                    <Carousel
                        opts={{
                            align: 'start',
                        }}
                        className="w-full max-w-sm md:max-w-xl lg:max-w-3xl mb-6"
                    >
                        <CarouselContent>
                            {customer.customerDocuments.map((doc, index) => (
                                <CarouselItem
                                    key={index}
                                    className={cn('', {
                                        'md:basis-1/2':
                                            customer.customerDocuments
                                                .length === 2,
                                        'md:basis-1/3':
                                            customer.customerDocuments.length >
                                            2,
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
                                        customer.customerDocuments.length <= 3,
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
