'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpokeSpinner } from '@/components/ui/spinner';

const ReviewStep = ({ isSaving }: { isSaving: boolean }) => {
    const [customerData, setCustomerData] = useState<any>(null);
    const [itemData, setItemData] = useState<any>(null);

    useEffect(() => {
        const customerId = localStorage.getItem('customerId');
        const formData = JSON.parse(localStorage.getItem('formData') || '{}');
        const selectedCustomer = JSON.parse(
            localStorage.getItem('selectedCustomer') || '{}',
        );

        if (customerId) {
            // If customerId exists, use selectedCustomer and specific formData attributes
            setCustomerData({
                name: selectedCustomer.name || 'Data customer tidak tersedia',
                status:
                    selectedCustomer.status || 'Data customer tidak tersedia',
            });

            setItemData({
                itemName: formData.itemName || 'Data item tidak tersedia',
                itemBrand: formData.itemBrand || 'Data item tidak tersedia',
                itemDesc: formData.itemDesc || 'Data item tidak tersedia',
                itemSerial: formData.itemSerial || 'Data item tidak tersedia',
                itemType: formData.itemType || 'Data item tidak tersedia',
                itemValue: formData.itemValue || 'Data item tidak tersedia',
                itemYear: formData.itemYear || 'Data item tidak tersedia',
            });
        } else {
            // If customerId doesn't exist, use only formData
            setCustomerData({
                name: formData.customerName || 'Data customer tidak tersedia',
                status: formData.status || 'Data customer tidak tersedia',
            }); // Indicate customer data is not available
            setItemData({
                itemName: formData.itemName || 'Data item tidak tersedia',
                itemBrand: formData.itemBrand || 'Data item tidak tersedia',
                itemDesc: formData.itemDesc || 'Data item tidak tersedia',
                itemSerial: formData.itemSerial || 'Data item tidak tersedia',
                itemType: formData.itemType || 'Data item tidak tersedia',
                itemValue: formData.itemValue || 'Data item tidak tersedia',
                itemYear: formData.itemYear || 'Data item tidak tersedia',
            });
        }
    }, []);
    return (
        <div className="space-y-6">
            {isSaving ? (
                <div className="w-full flex gap-2 flex-row items-center justify-center">
                    <SpokeSpinner size="md" />
                    <span className="text-md font-medium text-muted-foreground">
                        Menyimpan Data Barang...
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
                                        {itemData.itemValue}
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
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Deskripsi</strong>{' '}
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '} {itemData.itemDesc}
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
                                <div className="grid grid-cols-5">
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Nama</strong>
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {customerData.name}
                                    </span>
                                    <span className="col-span-2 md:col-span-1">
                                        <strong>Status</strong>
                                    </span>
                                    <span className="col-span-3 md:col-span-4">
                                        {': '}
                                        {customerData.status}
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
