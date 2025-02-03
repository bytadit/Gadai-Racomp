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
import {
    TriangleAlert,
    Pencil,
    PhoneCall,
    ArrowLeft,
    CheckCircle,
    CircleX,
} from 'lucide-react';
import Link from 'next/link';
import { cn, convertToIndonesianPhone, getAge } from '@/lib/utils';
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

export default function PemilikDetailPage({
    params,
}: {
    params: { itemId: string };
}) {
    const [customer, setCustomer] = useState<Customer | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // const router = useRouter();

    useEffect(() => {
        const fetchCustomer = async () => {
            try {
                const itemResponse = await fetch(
                    `/api/items/${params.itemId}`,
                    {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    },
                );
                if (!itemResponse.ok) {
                    throw new Error('Failed to fetch item');
                }
                const itemData = await itemResponse.json();
                const customerId = itemData.customer.id;
                const customerResponse = await fetch(
                    `/api/customers/${customerId}`,
                );
                if (!customerResponse.ok) {
                    throw new Error('Failed to fetch customer');
                }
                const data = await customerResponse.json();
                console.log(data);
                setCustomer(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomer();
    }, [params.itemId]);
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
        <PageContainer>
            <Card className="mx-auto w-full">
                <div className="m-3 flex space-x-2 justify-between">
                    <Link
                        href={`/dashboard/barang/${params.itemId}`}
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
                            <div className="py-2 col-span-2">
                                : {customer.name}
                            </div>
                        </div>
                        <div className="grid grid-cols-3">
                            <div className="py-2 font-semibold col-span-1">
                                NIK
                            </div>
                            <div className="py-2 col-span-2">
                                : {customer.nik}
                            </div>
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
                                Usia
                            </div>
                            <div className="py-2 col-span-2">
                                : {getAge(customer.birthdate)} {' tahun'}
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
                                        }}
                                    >
                                        {customer.customerPhones.map(
                                            (phone) => (
                                                <li
                                                    key={phone.id}
                                                    className="flex items-center gap-2 my-1"
                                                >
                                                    {phone.is_active ? (
                                                        <CheckCircle className="text-green-500 w-auto" />
                                                    ) : (
                                                        <CircleX className="text-red-500 w-auto" />
                                                    )}
                                                    <span
                                                        className={cn(
                                                            'flex justify-between flex-row items-center w-full max-w-xs',
                                                            phone.is_active
                                                                ? 'dark:text-white'
                                                                : 'text-muted-foreground',
                                                        )}
                                                    >
                                                        {phone.phone_number}
                                                    </span>
                                                    {phone.is_whatsapp ? (
                                                        <Link
                                                            target="_blank"
                                                            href={`https://wa.me/${convertToIndonesianPhone(phone.phone_number)}`}
                                                            className={cn(
                                                                'px-1 py-.5 text-xs',
                                                                buttonVariants({
                                                                    variant:
                                                                        'outline',
                                                                    size: 'sm',
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
                                                </li>
                                            ),
                                        )}
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
                                {customer.customerDocuments.map(
                                    (doc, index) => (
                                        <CarouselItem
                                            key={index}
                                            className={cn('', {
                                                'md:basis-1/2':
                                                    customer.customerDocuments
                                                        .length === 2,
                                                'md:basis-1/3':
                                                    customer.customerDocuments
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
                                                                src={
                                                                    doc.doc_url
                                                                }
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
                                            customer.customerDocuments.length <=
                                            3,
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
