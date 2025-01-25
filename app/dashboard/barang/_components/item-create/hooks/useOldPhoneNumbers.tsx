import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { customerSchema } from '../zodItemSchemas';

export function usePhoneNumbers(
    form: UseFormReturn<z.infer<typeof customerSchema>>,
) {
    const [phoneNumbers, setPhoneNumbers] = useState<
        z.infer<typeof customerSchema>['phone_numbers']
    >([{ phone_number: '', is_active: true, is_whatsapp: true }]);

    useEffect(() => {
        form.setValue('phone_numbers', phoneNumbers);
    }, [phoneNumbers, form]);

    const handlePhoneChange = (index: number, value: string) => {
        setPhoneNumbers((prev) => {
            const updatedPhones = [...prev];
            updatedPhones[index].phone_number = value;
            return updatedPhones as z.infer<
                typeof customerSchema
            >['phone_numbers'];
        });
    };

    const handleAddPhone = () => {
        setPhoneNumbers((prev) => [
            ...prev,
            {
                phone_number: '',
                is_active: prev.length === 0,
                is_whatsapp: false,
            },
        ]);
    };

    const handleRemovePhone = (index: number) => {
        setPhoneNumbers((prev) => {
            const updated = prev.filter((_, i) => i !== index);
            if (prev[index].is_active && updated.length > 0) {
                updated[0].is_active = true;
            }
            return updated as z.infer<typeof customerSchema>['phone_numbers'];
        });
    };

    const handleSetActive = (index: number) => {
        setPhoneNumbers(
            (prev) =>
                prev.map((phone, i) => ({
                    ...phone,
                    is_active: i === index,
                })) as z.infer<typeof customerSchema>['phone_numbers'],
        );
    };

    const handleSetWhatsapp = (index: number) => {
        setPhoneNumbers(
            (prev) =>
                prev.map((phone, i) =>
                    i === index
                        ? { ...phone, is_whatsapp: !phone.is_whatsapp }
                        : phone,
                ) as z.infer<typeof customerSchema>['phone_numbers'],
        );
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
