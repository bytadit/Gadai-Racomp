'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { ItemFormValues, itemSchema } from '../zodItemSchemas';
import { Label } from '@/components/ui/label';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency, parseCurrency } from '@/lib/utils';

type ItemType = z.infer<typeof itemSchema>['itemType'];
const ItemStep = () => {
    const {
        watch,
        setValue,
        register,
        trigger,
        formState: { errors },
    } = useFormContext<ItemFormValues>();
    return (
        <div className="space-y-4 text-start">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
                <div className="space-y-2">
                    <Label className="mb-2" htmlFor={register('itemName').name}>
                        Nama Barang
                    </Label>
                    <Input
                        id={register('itemName').name}
                        {...register('itemName')}
                        value={watch('itemName') || ''}
                    />
                    {errors.itemName && (
                        <span className="text-sm text-destructive">
                            {errors.itemName.message}
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label className="mb-2" htmlFor={register('itemType').name}>
                        Tipe Barang
                    </Label>
                    <RadioGroup
                        value={watch('itemType') || ''}
                        onValueChange={(value) => {
                            setValue('itemType', value as ItemType);
                            trigger('itemSerial'); // Validasi ulang itemSerial
                        }}
                        className="flex space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="KENDARAAN" />
                            <span className="font-normal">KENDARAAN</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="OTHER" />
                            <span className="font-normal">OTHER</span>
                        </div>
                    </RadioGroup>
                    {errors.itemType && (
                        <span className="text-sm text-destructive">
                            {errors.itemType.message}
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label className="mb-2" htmlFor="itemSerial">
                        Serial/NoPol
                    </Label>
                    <Input
                        id="itemSerial"
                        {...register('itemSerial')}
                        value={watch('itemSerial') || ''}
                        onChange={(e) => {
                            const itemType = watch('itemType'); // Ambil nilai itemType
                            const rawValue = e.target.value;

                            // Hanya format jika tipe = KENDARAAN
                            if (itemType === 'KENDARAAN') {
                                const cleanedValue = rawValue.replace(/-/g, '');
                                let part1 = '';
                                let part2 = '';
                                let part3 = '';
                                let currentPart: 'part1' | 'part2' | 'part3' =
                                    'part1';

                                // Proses karakter sesuai bagian
                                for (const char of cleanedValue) {
                                    if (currentPart === 'part1') {
                                        if (
                                            /^[A-Za-z]$/.test(char) &&
                                            part1.length < 2
                                        ) {
                                            part1 += char.toUpperCase();
                                        } else if (
                                            /^\d$/.test(char) &&
                                            part1.length > 0
                                        ) {
                                            currentPart = 'part2';
                                            part2 += char;
                                        }
                                    } else if (currentPart === 'part2') {
                                        if (
                                            /^\d$/.test(char) &&
                                            part2.length < 4
                                        ) {
                                            part2 += char;
                                        } else if (
                                            /^[A-Za-z]$/.test(char) &&
                                            part2.length > 0
                                        ) {
                                            currentPart = 'part3';
                                            part3 += char.toUpperCase();
                                        }
                                    } else if (currentPart === 'part3') {
                                        if (
                                            /^[A-Za-z]$/.test(char) &&
                                            part3.length < 3
                                        ) {
                                            part3 += char.toUpperCase();
                                        }
                                    }
                                }

                                // Bangun format dengan hyphen
                                const formatted = [part1, part2, part3]
                                    .filter(Boolean)
                                    .join('-');

                                setValue('itemSerial', formatted, {
                                    shouldValidate: true,
                                });
                            } else {
                                // Untuk tipe OTHER: biarkan input bebas tanpa format
                                setValue('itemSerial', rawValue, {
                                    shouldValidate: true,
                                });
                            }
                        }}
                    />
                    {errors.itemSerial && (
                        <span className="text-sm text-destructive">
                            {errors.itemSerial.message}
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label className="mb-2" htmlFor={register('itemYear').name}>
                        Tahun Barang
                    </Label>
                    <Input
                        type={'number'}
                        id={register('itemYear').name}
                        {...register('itemYear', {
                            valueAsNumber: true, // Automatically converts input to a number
                        })}
                        value={watch('itemYear') || ''}
                    />
                    {errors.itemYear && (
                        <span className="text-sm text-destructive">
                            {errors.itemYear.message}
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label
                        className="mb-2"
                        htmlFor={register('itemValue').name}
                    >
                        Nilai Barang
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            Rp.
                        </span>
                        <Input
                            type="text"
                            id={register('itemValue').name}
                            className="pl-10" // Memberi padding kiri agar text tidak tertimpa
                            {...register('itemValue', {
                                setValueAs: (value) =>
                                    value ? parseCurrency(value) : null,
                            })}
                            value={
                                watch('itemValue')
                                    ? formatCurrency(watch('itemValue'))
                                    : ''
                            }
                            onChange={(e) => {
                                const parsedValue = parseCurrency(
                                    e.target.value,
                                );
                                setValue('itemValue', parsedValue);
                            }}
                            onFocus={(e) => {
                                const currentValue = watch('itemValue') || 0;
                                e.target.value = currentValue.toString();
                            }}
                            onBlur={(e) => {
                                if (watch('itemValue')) {
                                    e.target.value = formatCurrency(
                                        watch('itemValue'),
                                    );
                                }
                            }}
                        />
                    </div>
                    {errors.itemValue && (
                        <span className="text-sm text-destructive">
                            {errors.itemValue.message}
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label
                        className="mb-2"
                        htmlFor={register('itemBrand').name}
                    >
                        Merk Barang
                    </Label>
                    <Input
                        id={register('itemBrand').name}
                        {...register('itemBrand')}
                        value={watch('itemBrand') || ''}
                    />
                    {errors.itemBrand && (
                        <span className="text-sm text-destructive">
                            {errors.itemBrand.message}
                        </span>
                    )}
                </div>
            </div>
            <div className="space-y-2">
                <Label className="mb-2" htmlFor={register('itemDesc').name}>
                    Deskripsi Barang
                </Label>
                <Textarea
                    id={register('itemDesc').name}
                    {...register('itemDesc')}
                    placeholder="Masukkan deskripsi barang"
                    value={watch('itemDesc') || ''}
                />
                {errors.itemDesc && (
                    <span className="text-sm text-destructive">
                        {errors.itemDesc.message}
                    </span>
                )}
            </div>
        </div>
    );
};
export default ItemStep;
