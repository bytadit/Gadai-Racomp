'use client';

import React, { useEffect, useState } from 'react';
import { useStepper, steps, utils } from './itemStepper';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import CustomerStep from './steps/customer-form';
import PaymentStep from './steps/item-form';
import CompleteStep from './steps/review-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { z } from 'zod';
import { toast } from 'sonner';

const LOCAL_STORAGE_KEY_FORM = 'formData';
const LOCAL_STORAGE_KEY_STEP = 'currentStep';

const ItemCreate = () => {
    const stepper = useStepper();
    const stepIds = stepper.all.map((step) => step.id);
    const existingCustomerId = localStorage.getItem('customerId');
    const isExistingCustomer = existingCustomerId !== null;

    // State to manage form schema dynamically
    const [formSchema, setFormSchema] = useState(() =>
        isExistingCustomer ? z.object({}) : stepper.current.schema,
    );

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
    useEffect(() => {
        localStorage.setItem(LOCAL_STORAGE_KEY_STEP, stepper.current.id);
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
        const validatedStep = stepIds.includes(
            savedStep as (typeof stepIds)[number],
        )
            ? (savedStep as (typeof stepIds)[number])
            : null;
        if (validatedStep) {
            stepper.goTo(validatedStep);
        }
    }, [setValue, stepper]);
    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const currentCustomerId = localStorage.getItem('customerId'); // Dynamically fetch customerId
        if (currentCustomerId && currentCustomerId === '') {
            toast.error('Pilih customer dulu!');
            return;
        }
        console.log(`Form values for step ${stepper.current.id}:`, values);
        if (stepper.isLast) {
            stepper.reset();
            localStorage.clear();
        } else {
            stepper.next();
        }
    };
    const currentIndex = utils.getIndex(stepper.current.id);
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
                            Tahap {currentIndex + 1} dari {steps.length}
                        </span>
                    </div>
                </div>
                <nav aria-label="Checkout Steps" className="group my-4">
                    <ol
                        className="flex items-center justify-between gap-2"
                        aria-orientation="horizontal"
                    >
                        {stepper.all.map((step, index, array) => (
                            <React.Fragment key={step.id}>
                                <li className="flex items-center gap-4 flex-shrink-0">
                                    <Button
                                        type="button"
                                        role="tab"
                                        variant={
                                            index <= currentIndex
                                                ? 'default'
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
                                            if (!valid) return;
                                            if (index - currentIndex > 1)
                                                return;
                                            stepper.goTo(step.id);
                                        }}
                                    >
                                        {index + 1}
                                    </Button>
                                    <span className="text-sm font-medium">
                                        {step.label}
                                    </span>
                                </li>
                                {index < array.length - 1 && (
                                    <Separator
                                        className={`flex-1 ${
                                            index < currentIndex
                                                ? 'bg-primary'
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
                        payment: () => <PaymentStep />,
                        review: () => <CompleteStep />,
                    })}
                    {!stepper.isLast ? (
                        <div className="flex justify-end gap-4">
                            <Button
                                variant="secondary"
                                onClick={stepper.prev}
                                disabled={stepper.isFirst}
                            >
                                Back
                            </Button>
                            <Button type="submit">
                                {stepper.isLast ? 'Finish' : 'Next'}
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={stepper.reset}>Reset</Button>
                    )}
                </div>
            </form>
        </Form>
    );
};

export default ItemCreate;
