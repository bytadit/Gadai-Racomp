'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { ItemFormValues, itemSchema } from '../zodItemSchemas';
import { Label } from '@/components/ui/label';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type ItemType = z.infer<typeof itemSchema>['itemType'];
const ItemStep = () => {
    const {
        watch,
        setValue,
        register,
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
                    <Label
                        className="mb-2"
                        htmlFor={register('itemSerial').name}
                    >
                        Serial/NoPol
                    </Label>
                    <Input
                        id={register('itemSerial').name}
                        {...register('itemSerial')}
                        value={watch('itemSerial') || ''}
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
                    <Input
                        type={'number'}
                        id={register('itemValue').name}
                        {...register('itemValue')}
                        value={watch('itemValue') || ''}
                    />
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
                <div className="space-y-2">
                    <Label className="mb-2" htmlFor={register('itemType').name}>
                        Tipe Barang
                    </Label>
                    <RadioGroup
                        value={watch('itemType') || ''}
                        onValueChange={(value) =>
                            setValue('itemType', value as ItemType)
                        }
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
