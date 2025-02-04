'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpokeSpinner } from '@/components/ui/spinner';
import {
    cn,
    convertToIndonesianPhone,
    formatDate,
    formatToIndonesianCurrency,
    getAge,
} from '@/lib/utils';
import { CheckCircle, CircleX, PhoneCall } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// import { CustomerPhone } from '@prisma/client';

const ReviewStep = ({ isSaving }: { isSaving: boolean }) => {
    const [customerData, setCustomerData] = useState<any>(null);
    const [itemData, setItemData] = useState<any>(null);
    const [transactionData, setTransactionData] = useState<any>(null);
    useEffect(() => {
        const customerId = localStorage.getItem('customerId');
        const itemId = localStorage.getItem('itemId');
        const formData = JSON.parse(localStorage.getItem('formData') || '{}');
        const selectedCustomer = JSON.parse(
            localStorage.getItem('selectedCustomer') || '{}',
        );
        const selectedItem = JSON.parse(
            localStorage.getItem('selectedItem') || '{}',
        );
        if (customerId) {
            // If customerId exists, use selectedCustomer and specific formData attributes
            setCustomerData({
                name: selectedCustomer.name || 'Data customer tidak tersedia',
                status:
                    selectedCustomer.status || 'Data customer tidak tersedia',
                gender:
                    selectedCustomer.gender || 'Data customer tidak tersedia',
                nik: selectedCustomer.nik || 'Data customer tidak tersedia',
                desc: selectedCustomer.desc || 'kosong',
            });
        } else {
            // If customerId doesn't exist, use only formData
            setCustomerData({
                name: formData.customerName || 'Data customer tidak tersedia',
                status: formData.status || 'Data customer tidak tersedia',
                address: formData.address || 'Data customer tidak tersedia',
                birthdate: formData.birthdate || 'Data customer tidak tersedia',
                desc: formData.customerDesc || 'Data customer tidak tersedia',
                gender: formData.gender || 'Data customer tidak tersedia',
                nik: formData.nik || 'Data customer tidak tersedia',
                phone_numbers: formData.phone_numbers || [],
            }); // Indicate customer data is not available
        }
        if (itemId) {
            setItemData({
                itemName: selectedItem.name || 'Data customer tidak tersedia',
                itemBrand: selectedItem.brand || 'Data item tidak tersedia',
                itemSerial: selectedItem.serial || 'Data item tidak tersedia',
                itemType: selectedItem.type || 'Data item tidak tersedia',
                itemValue: selectedItem.value || 'Data item tidak tersedia',
                itemYear: selectedItem.year || 'Data item tidak tersedia',
            });
        } else {
            setItemData({
                itemName: formData.itemName || 'Data item tidak tersedia',
                itemBrand: formData.itemBrand || 'Data item tidak tersedia',
                itemSerial: formData.itemSerial || 'Data item tidak tersedia',
                itemType: formData.itemType || 'Data item tidak tersedia',
                itemValue: formData.itemValue || 'Data item tidak tersedia',
                itemYear: formData.itemYear || 'Data item tidak tersedia',
            });
        }
        setTransactionData({
            transNilaiPinjaman:
                formData.transNilaiPinjaman || 'Data transaksi tidak tersedia',
            transPersenTanggungan:
                formData.transPersenTanggungan ||
                'Data transaksi tidak tersedia',
            transWaktuPinjam:
                formData.transWaktuPinjam || 'Data transaksi tidak tersedia',
            transType: formData.transType || 'Data transaksi tidak tersedia',
            transDuration:
                formData.transDuration || 'Data transaksi tidak tersedia',
            transJatuhTempo:
                formData.transJatuhTempo || 'Data transaksi tidak tersedia',
            transTanggunganAwal:
                formData.transTanggunganAwal || 'Data transaksi tidak tersedia',
            transDesc: formData.transDesc || 'kosong',
        });
    }, []);
    return (
        <div className="space-y-6">
            {isSaving ? (
                <div className="w-full flex gap-2 flex-row items-center justify-center">
                    <SpokeSpinner size="md" />
                    <span className="text-md font-medium text-muted-foreground">
                        Menyimpan Data Transaksi...
                    </span>
                </div>
            ) : (
                <>
                    <h2 className="scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0">
                        Review Data
                    </h2>
                    <span className="text-sm mt-4">
                        Silakan cek data sebelum menyimpan!
                    </span>
                    {/* Transaction Data Card */}
                    <Card>
                        <CardHeader className="border-b mb-4">
                            <CardTitle>
                                Data Transaksi{' '}
                                {itemData?.itemType === 'KENDARAAN'
                                    ? 'Kendaraan'
                                    : 'Barang'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {transactionData ? (
                                <div className="grid grid-cols-5 gap-2">
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Nilai Pinjaman</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {formatToIndonesianCurrency(
                                            transactionData.transNilaiPinjaman,
                                        )}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>% Tanggungan</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}{' '}
                                        {formatToIndonesianCurrency(
                                            transactionData.transPersenTanggungan,
                                        )}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Waktu Gadai</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {formatDate(
                                            transactionData.transWaktuPinjam.toLocaleString(),
                                        )}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Tipe Transaksi</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {transactionData.transType}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Durasi Gadai</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {transactionData.transDuration}{' '}
                                        {' bulan'}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Jatuh Tempo</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {formatDate(
                                            transactionData.transJatuhTempo.toLocaleString(),
                                        )}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Tanggungan Awal</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {formatToIndonesianCurrency(
                                            transactionData.transTanggunganAwal,
                                        )}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Catatan</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {transactionData.transDesc}
                                    </span>
                                </div>
                            ) : (
                                <p>Data barang tidak tersedia</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Item Data Card */}
                    <Card>
                        <CardHeader className="border-b mb-4">
                            <CardTitle>
                                Data{' '}
                                {itemData?.itemType === 'KENDARAAN'
                                    ? 'Kendaraan'
                                    : 'Barang'}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {itemData ? (
                                <div className="grid grid-cols-5 gap-2">
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Nama</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {itemData.itemName}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Tipe</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '} {itemData.itemType}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Nilai</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {formatToIndonesianCurrency(
                                            itemData.itemValue,
                                        )}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Merk</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {itemData.itemBrand}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>
                                            {' '}
                                            {itemData.itemType === 'KENDARAAN'
                                                ? 'Nomor Polisi'
                                                : 'Serial Barang'}
                                        </strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '} {itemData.itemSerial}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Tahun</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {itemData.itemYear}
                                    </span>
                                </div>
                            ) : (
                                <p>Data barang tidak tersedia</p>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="border-b mb-4">
                            <CardTitle>Data Pelanggan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {customerData ? (
                                <div className="grid grid-cols-5 gap-2">
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Nama</strong>
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {customerData.name}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Gender</strong>
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {customerData.gender}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>NIK</strong>
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {customerData.nik}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Status</strong>
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        <Badge variant={customerData.status}>
                                            {customerData.status}
                                        </Badge>
                                    </span>
                                    {customerData.birthdate && (
                                        <>
                                            <span className="col-span-2 md:col-span-1">
                                                <strong>Usia</strong>
                                            </span>
                                            <span className="col-span-3 md:col-span-4">
                                                {': '}
                                                {getAge(
                                                    customerData.birthdate,
                                                )}{' '}
                                                {' tahun'}
                                            </span>
                                            <span className="col-span-2 md:col-span-1">
                                                <strong>Alamat</strong>
                                            </span>
                                            <span className="col-span-3 md:col-span-4">
                                                {': '}
                                                {customerData.address}
                                            </span>
                                            <span className="col-span-2 md:col-span-1">
                                                <strong>No Telepon</strong>
                                            </span>
                                            <span className="col-span-3 md:col-span-4">
                                                {customerData.phone_numbers
                                                    .length <= 0 ? (
                                                    ': Nomor kosong'
                                                ) : (
                                                    <ul
                                                        style={{
                                                            listStyleType:
                                                                'disc',
                                                        }}
                                                    >
                                                        {customerData.phone_numbers.map(
                                                            (
                                                                phone: {
                                                                    phone_number: string;
                                                                    is_active: boolean;
                                                                    is_whatsapp: boolean;
                                                                },
                                                                index: number,
                                                            ) => (
                                                                <li
                                                                    key={index}
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
                                                                        {
                                                                            phone.phone_number
                                                                        }
                                                                    </span>
                                                                    {phone.is_whatsapp ? (
                                                                        <Link
                                                                            target="_blank"
                                                                            href={`https://wa.me/${convertToIndonesianPhone(phone.phone_number)}`}
                                                                            className={cn(
                                                                                'px-1 py-.5 text-xs',
                                                                                buttonVariants(
                                                                                    {
                                                                                        variant:
                                                                                            'outline',
                                                                                        size: 'sm',
                                                                                    },
                                                                                ),
                                                                            )}
                                                                        >
                                                                            <PhoneCall
                                                                                size={
                                                                                    2
                                                                                }
                                                                                color={
                                                                                    'green'
                                                                                }
                                                                            />
                                                                            {
                                                                                ' WA'
                                                                            }
                                                                        </Link>
                                                                    ) : (
                                                                        ''
                                                                    )}
                                                                </li>
                                                            ),
                                                        )}
                                                    </ul>
                                                )}
                                            </span>
                                        </>
                                    )}
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Deskripsi</strong>
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {customerData.desc}
                                    </span>
                                </div>
                            ) : (
                                <p>Data pelanggan tidak tersedia</p>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default ReviewStep;
