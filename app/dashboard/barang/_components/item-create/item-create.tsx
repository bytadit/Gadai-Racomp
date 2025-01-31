'use client';

import React, { useEffect, useState } from 'react';
import { useStepper, steps, utils } from './itemStepper';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import CustomerStep from './steps/customer-form';
import ItemStep from './steps/item-form';
import ReviewStep from './steps/review-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { toast } from 'sonner';
import CompleteStep from './steps/complete-form';
import { CircleCheck } from 'lucide-react';
import { useCustomerCheck } from './hooks/useCustomerCheck';

const LOCAL_STORAGE_KEY_FORM = 'formData';
const LOCAL_STORAGE_KEY_STEP = 'currentStep';

const ItemCreate = () => {
    const { checkCustomer } = useCustomerCheck();
    const stepper = useStepper(
        // Type assertion untuk initial step
        (localStorage.getItem(
            LOCAL_STORAGE_KEY_STEP,
        ) as (typeof steps)[number]['id']) || steps[0].id,
    );
    const stepIds = stepper.all.map((step) => step.id);
    const existingCustomerId = localStorage.getItem('customerId');
    let isExistingCustomer = false;

    if (stepper.current.id === 'customer') {
        isExistingCustomer = existingCustomerId !== null;
    } else if (stepper.current.id === 'item') {
        isExistingCustomer = false;
    } else if (stepper.current.id === 'review') {
        isExistingCustomer = true;
    }

    // State to manage form schema dynamically
    const [formSchema, setFormSchema] = useState(() =>
        isExistingCustomer ? z.object({}) : stepper.current.schema,
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isFinished, setIsFinished] = useState(false);

    // Update schema dynamically when `isExistingCustomer` changes
    useEffect(() => {
        setFormSchema(
            isExistingCustomer ? z.object({}) : stepper.current.schema,
        );
    }, [isExistingCustomer, stepper.current.schema]);

    const form = useForm({
        mode: 'onTouched',
        resolver: zodResolver(formSchema),
        defaultValues: {},
    });
    const {
        setValue,
        watch,
        formState: { errors },
    } = form;
    useEffect(() => {
        const subscription = watch((data) => {
            localStorage.setItem(LOCAL_STORAGE_KEY_FORM, JSON.stringify(data));
        });
        return () => subscription.unsubscribe();
    }, [watch]);
    // useEffect(() => {
    //     localStorage.setItem(LOCAL_STORAGE_KEY_STEP, stepper.current.id);
    // }, [stepper.current.id]);
    useEffect(() => {
        if (stepper.current.id) {
            localStorage.setItem(LOCAL_STORAGE_KEY_STEP, stepper.current.id);
        }
    }, [stepper.current.id]);
    useEffect(() => {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY_FORM);
        const savedStep = localStorage.getItem(LOCAL_STORAGE_KEY_STEP);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            Object.keys(parsedData).forEach((key) => {
                if (key === 'birthdate') {
                    parsedData[key] = new Date(parsedData[key]);
                }
                setValue(key, parsedData[key]);
            });
        }
        // Gunakan steps langsung dari import daripada dari stepper
        const validStepIds = steps.map((step) => step.id);
        const isValidStep =
            savedStep && validStepIds.includes(savedStep as any);

        if (isValidStep) {
            // Tunggu hingga stepper selesai inisialisasi
            setTimeout(() => {
                stepper.goTo(savedStep as (typeof validStepIds)[number]);
            }, 0);
        }
    }, [setValue, stepper]); // Hapus stepIds dari dependencies
    const [submissionStatus, setSubmissionStatus] = useState<
        'success' | 'error' | null
    >(null);
    const handleReset = () => {
        // Reset the stepper to the first step
        stepper.goTo(steps[0].id);

        // Clear the form data from local storage
        localStorage.removeItem(LOCAL_STORAGE_KEY_FORM);
        localStorage.removeItem(LOCAL_STORAGE_KEY_STEP);
        localStorage.removeItem('itemId');
        form.reset();
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        if (!checkCustomer()) return;
        console.log(`Form values for step ${stepper.current.id}:`, values);

        if (stepper.current.id === 'review') {
            const formData = JSON.parse(
                localStorage.getItem('formData') || '{}',
            );
            const selectedCustomer = JSON.parse(
                localStorage.getItem('selectedCustomer') || '{}',
            );

            try {
                setIsSaving(true);

                let customerId = selectedCustomer.id; // Default to existing customerId
                if (customerId == null) {
                    // POST new customer data
                    const customerResponse = await fetch('/api/customers', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: formData.customerName,
                            nik: formData.nik,
                            birthdate: new Date(formData.birthdate),
                            gender: formData.gender,
                            status: formData.status,
                            address: formData.address,
                            desc: formData.customerDesc,
                        }),
                    });

                    if (!customerResponse.ok) {
                        setSubmissionStatus('error');
                        toast.error('Gagal menyimpan data pelanggan!');
                        setIsSaving(false);
                        return;
                    }
                    setSubmissionStatus('success');
                    toast.success('Berhasil menyimpan data pelanggan!');
                    const { customer } = await customerResponse.json();
                    customerId = customer.id;

                    // POST customer phone numbers
                    const phoneData = formData.phone_numbers.map(
                        (phone: any) => ({
                            customer_id: customerId,
                            phone_number: phone.phone_number,
                            is_active: phone.is_active,
                            is_whatsapp: phone.is_whatsapp,
                        }),
                    );

                    const phonesResponse = await fetch('/api/customer-phones', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(phoneData),
                    });

                    if (!phonesResponse.ok) {
                        setSubmissionStatus('error');
                        toast.error('Gagal menyimpan data nomor telepon!');
                        setIsSaving(false);
                        return;
                    }
                    setSubmissionStatus('success');
                    toast.success('Berhasil menyimpan data nomor telepon!');
                }
                // POST new item data
                const itemResponse = await fetch('/api/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: formData.itemName,
                        type: formData.itemType,
                        desc: formData.itemDesc,
                        year: formData.itemYear,
                        value: parseFloat(formData.itemValue),
                        brand: formData.itemBrand,
                        serial: formData.itemSerial,
                        customerId: customerId, // Use the correct customerId (either new or existing)
                    }),
                });

                if (!itemResponse.ok) {
                    setSubmissionStatus('error');
                    toast.error('Gagal menyimpan data barang!');
                    setIsSaving(false);
                    return;
                }
                const { item } = await itemResponse.json();
                setSubmissionStatus('success');
                toast.success('Berhasil menyimpan data barang!');

                // Clear localStorage and move to the next step
                localStorage.clear();
                localStorage.setItem('itemId', item.id);
                stepper.reset();
                setIsSaving(false);
                stepper.next();
                setIsFinished(true);
            } catch (error: any) {
                setSubmissionStatus('error');
                toast.error(error.message || 'Gagal menyimpan data!');
                setIsSaving(false);
            }
        } else {
            stepper.next();
        }
    };
    // const currentIndex = utils.getIndex(stepper.current.id);
    const currentIndex = steps.findIndex(
        (step) => step.id === stepper.current.id,
    );

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 p-6 border rounded-lg"
            >
                <div className="flex justify-between">
                    <h2 className="text-lg font-medium">Input Data Barang</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            {currentIndex + 1} dari {steps.length}
                        </span>
                    </div>
                </div>
                <nav aria-label="Item Create Steps" className="group my-4">
                    <ol
                        className="flex items-center justify-between gap-2"
                        aria-orientation="horizontal"
                    >
                        {stepper.all.map((step, index, array) => (
                            <React.Fragment key={step.id}>
                                <li className="flex items-center gap-4 flex-shrink-0">
                                    <Button
                                        disabled={isFinished}
                                        type="button"
                                        role="tab"
                                        variant={
                                            index <= currentIndex
                                                ? isFinished
                                                    ? 'success'
                                                    : 'default'
                                                : 'secondary'
                                        }
                                        aria-current={
                                            stepper.current.id === step.id
                                                ? 'step'
                                                : undefined
                                        }
                                        aria-posinset={index + 1}
                                        aria-setsize={steps.length}
                                        aria-selected={
                                            stepper.current.id === step.id
                                        }
                                        className="flex size-10 items-center justify-center rounded-full"
                                        onClick={async () => {
                                            const valid = await form.trigger();
                                            if (!valid || !checkCustomer())
                                                return;
                                            if (index - currentIndex > 1)
                                                return;
                                            stepper.goTo(step.id);
                                        }}
                                    >
                                        {isFinished ? (
                                            <CircleCheck
                                                color="white"
                                                size={32}
                                            />
                                        ) : (
                                            index + 1
                                        )}
                                    </Button>
                                    <span className="text-sm font-medium hidden sm:flex">
                                        {step.label}
                                    </span>
                                </li>
                                {index < array.length - 1 && (
                                    <Separator
                                        className={`flex-1 ${
                                            index < currentIndex
                                                ? isFinished
                                                    ? 'success'
                                                    : 'primary'
                                                : 'bg-muted'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </ol>
                </nav>
                <div className="space-y-4">
                    {stepper.switch({
                        customer: () => <CustomerStep />,
                        item: () => <ItemStep />,
                        review: () => <ReviewStep isSaving={isSaving} />,
                        complete: () => (
                            <CompleteStep
                                handleReset={handleReset}
                                status={submissionStatus}
                            />
                        ),
                    })}
                    {stepper.current.id !== 'complete' &&
                        (stepper.current.id !== 'review' ? (
                            <div className="flex justify-end gap-4">
                                <Button
                                    variant="secondary"
                                    onClick={stepper.prev}
                                    disabled={stepper.isFirst}
                                >
                                    Back
                                </Button>
                                {!stepper.isLast && (
                                    <Button type="submit">Next</Button>
                                )}
                            </div>
                        ) : (
                            <div className="flex justify-end gap-4">
                                <Button type="submit">Simpan Data</Button>
                            </div>
                        ))}
                </div>
            </form>
        </Form>
    );
};

export default ItemCreate;
