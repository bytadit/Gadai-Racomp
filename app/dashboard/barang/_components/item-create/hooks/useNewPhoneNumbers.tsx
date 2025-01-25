// import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { CustomerFormValues, customerSchema } from '../zodItemSchemas';

export function usePhoneNumbers({
    setValue,
    watch,
}: Pick<UseFormReturn<CustomerFormValues>, 'setValue' | 'watch'>) {
    const phoneNumbers = watch('phone_numbers') || [
        { phone_number: '', is_active: true, is_whatsapp: true },
    ];
    

    const handlePhoneChange = (index: number, value: string) => {
        const updatedPhones = [...phoneNumbers];
        updatedPhones[index].phone_number = value;
        setValue('phone_numbers', updatedPhones as z.infer<typeof customerSchema>['phone_numbers'], { shouldDirty: true });
    };

    const handleAddPhone = () => {
        const updatedPhones = [
            ...phoneNumbers,
            {
                phone_number: '',
                is_active: phoneNumbers.length === 0,
                is_whatsapp: false,
            },
        ];
        setValue('phone_numbers', updatedPhones as z.infer<typeof customerSchema>['phone_numbers'], { shouldDirty: true });
    };

    const handleRemovePhone = (index: number) => {
        const updatedPhones = phoneNumbers.filter((_, i) => i !== index);
        if (phoneNumbers[index].is_active && updatedPhones.length > 0) {
            updatedPhones[0].is_active = true;
        }
        setValue('phone_numbers', updatedPhones as z.infer<typeof customerSchema>['phone_numbers'], { shouldDirty: true });
    };

    const handleSetActive = (index: number) => {
        const updatedPhones = phoneNumbers.map((phone, i) => ({
            ...phone,
            is_active: i === index,
        }));
        setValue('phone_numbers', updatedPhones as z.infer<typeof customerSchema>['phone_numbers'], { shouldDirty: true });
    };

    const handleSetWhatsapp = (index: number) => {
        const updatedPhones = phoneNumbers.map((phone, i) =>
            i === index
                ? { ...phone, is_whatsapp: !phone.is_whatsapp }
                : phone
        );
        setValue('phone_numbers', updatedPhones as z.infer<typeof customerSchema>['phone_numbers'], { shouldDirty: true });
    };

    return {
        phoneNumbers,
        handlePhoneChange,
        handleAddPhone,
        handleRemovePhone,
        handleSetActive,
        handleSetWhatsapp,
    };
}