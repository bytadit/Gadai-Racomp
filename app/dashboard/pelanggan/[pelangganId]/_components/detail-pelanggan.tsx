'use client';
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { SpokeSpinner } from '@/components/ui/spinner';
import { TriangleAlert, Pencil, PhoneCall, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Customer = {
    id: number;
    name: string;
    nik: string;
    address: string;
    desc?: string;
    birthdate: string;
    gender: 'PRIA' | 'WANITA';
    customerPhones: CustomerPhone[]; // Specify the type of customerPhones
};

type CustomerPhone = {
    id: number;
    customerId: number;
    phone_number: string;
    is_active: boolean;
    is_whatsapp: boolean;
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
        </Card>
    );
}
