'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { TransactionFormValues, transactionSchema } from '@/lib/zod-schemas';
import { Label } from '@/components/ui/label';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency, parseCurrency } from '@/lib/utils';
// import { Switch } from '@/components/ui/switch';
import { DateTimePicker } from '@/components/date-time-picker';
import { Toggle } from '@/components/ui/toggle';
import { Calendar, RefreshCw, SquarePen } from 'lucide-react';

type TransactionType = z.infer<typeof transactionSchema>['transType'];
const TransactionStep = () => {
    const {
        watch,
        setValue,
        register,
        // trigger,
        control,
        formState: { errors },
    } = useFormContext<TransactionFormValues>();
    // Use useWatch to subscribe to the two key fields.
    const transWaktuPinjamValue = useWatch({
        control,
        name: 'transWaktuPinjam',
    });
    const transDurationValue = useWatch({
        control,
        name: 'transDuration',
    });

    // Ensure default values for transWaktuPinjam and transType.
    useEffect(() => {
        if (!transWaktuPinjamValue) {
            setValue('transWaktuPinjam', new Date());
        }
        if (!watch('transType')) {
            setValue('transType', 'PAKAI');
        }
    }, [setValue, transWaktuPinjamValue, watch]);
    // useEffect(() => {
    //     if (!watch('transWaktuPinjam')) {
    //         setValue('transWaktuPinjam', new Date());
    //     } else if (!watch('transType')) {
    //         setValue('transType', 'PAKAI');
    //     }
    // }, [setValue, watch]);
    // Override state for jatuh tempo
    // const [isOverrideJatuhTempo, setIsOverrideJatuhTempo] = useState<boolean>(
    //     () => {
    //         if (typeof window !== 'undefined') {
    //             const saved = localStorage.getItem('jatuhTempoOverride');
    //             return saved !== null ? saved === 'true' : false;
    //         }
    //         return false;
    //     },
    // );

    // Override state for "jatuh tempo"
    const [isOverrideJatuhTempo, setIsOverrideJatuhTempo] = useState<boolean>(
        () => {
            if (typeof window !== 'undefined') {
                const saved = localStorage.getItem('jatuhTempoOverride');
                return saved !== null ? saved === 'true' : false;
            }
            return false;
        },
    );
    useEffect(() => {
        localStorage.setItem(
            'jatuhTempoOverride',
            isOverrideJatuhTempo.toString(),
        );
        if (!isOverrideJatuhTempo) {
            // Get the duration (default to 1 if not set)
            const duration = transDurationValue || 1;
            // Use the transWaktuPinjam value as the base date; fallback to new Date()
            const baseDate = transWaktuPinjamValue
                ? new Date(transWaktuPinjamValue)
                : new Date();
            // Clone the base date and add the duration (in months)
            const newJatuhTempo = new Date(baseDate);
            newJatuhTempo.setMonth(newJatuhTempo.getMonth() + duration);
            setValue('transJatuhTempo', newJatuhTempo);
        }
    }, [
        transWaktuPinjamValue,
        transDurationValue,
        isOverrideJatuhTempo,
        setValue,
    ]);

    // Initialize default values
    useEffect(() => {
        const initialDuration = 1;
        const baseDate = transWaktuPinjamValue
            ? new Date(transWaktuPinjamValue)
            : new Date();
        const initialJatuhTempo = new Date(baseDate);
        initialJatuhTempo.setMonth(
            initialJatuhTempo.getMonth() + initialDuration,
        );
        if (!transDurationValue) {
            setValue('transDuration', initialDuration);
        }
        if (!watch('transJatuhTempo')) {
            setValue('transJatuhTempo', initialJatuhTempo);
        }
    }, [setValue, transWaktuPinjamValue, transDurationValue, watch]);

    // const [isOverride, setIsOverride] = useState(false);
    const [isOverride, setIsOverride] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('percentOverride');
            return saved !== null ? saved === 'true' : false;
        }
        return false;
    });
    useEffect(() => {
        localStorage.setItem('percentOverride', isOverride.toString());
        if (!isOverride) {
            const nilaiPinjaman = watch('transNilaiPinjaman') || 0;
            const persenTanggungan = nilaiPinjaman * 0.05;
            setValue('transPersenTanggungan', persenTanggungan);
        }
    }, [watch('transNilaiPinjaman'), isOverride, setValue]);

    const [waktuPinjamNow, setWaktuPinjamNow] = useState<boolean>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('waktuPinjamNow');
            return saved !== null ? saved === 'true' : true;
        }
        return true;
    });
    useEffect(() => {
        localStorage.setItem('waktuPinjamNow', waktuPinjamNow.toString());
        if (waktuPinjamNow) {
            // When toggle is active, force the form value to now.
            setValue('transWaktuPinjam', new Date());
        }
    }, [waktuPinjamNow, setValue]);
    // Add this useEffect for transTanggunganAwal calculation
    useEffect(() => {
        const nilaiPinjaman = watch('transNilaiPinjaman') || 0;
        const persenTanggungan = watch('transPersenTanggungan') || 0;
        const duration = watch('transDuration') || 1;

        const tanggunganAwal = nilaiPinjaman + duration * persenTanggungan;
        setValue('transTanggunganAwal', tanggunganAwal);

        // Save to localStorage
        localStorage.setItem('transTanggunganAwal', tanggunganAwal.toString());
    }, [
        watch('transNilaiPinjaman'),
        watch('transPersenTanggungan'),
        watch('transDuration'),
        setValue,
    ]);

    return (
        <div className="space-y-4 text-start">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
                <div className="space-y-2">
                    <Label
                        className="mb-2"
                        htmlFor={register('transNilaiPinjaman').name}
                    >
                        Nilai Pinjaman
                    </Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            Rp.
                        </span>
                        <Input
                            type="text"
                            id={register('transNilaiPinjaman').name}
                            className="pl-10" // Memberi padding kiri agar text tidak tertimpa
                            {...register('transNilaiPinjaman', {
                                setValueAs: (value) =>
                                    value ? parseCurrency(value) : 0,
                            })}
                            value={
                                watch('transNilaiPinjaman')
                                    ? formatCurrency(
                                          watch('transNilaiPinjaman'),
                                      )
                                    : ''
                            }
                            onChange={(e) => {
                                const parsedValue = parseCurrency(
                                    e.target.value,
                                );
                                setValue('transNilaiPinjaman', parsedValue);
                            }}
                            onFocus={(e) => {
                                const currentValue =
                                    watch('transNilaiPinjaman') || 0;
                                e.target.value = currentValue.toString();
                            }}
                            onBlur={(e) => {
                                if (watch('transNilaiPinjaman')) {
                                    e.target.value = formatCurrency(
                                        watch('transNilaiPinjaman'),
                                    );
                                }
                            }}
                        />
                    </div>
                    {errors.transNilaiPinjaman && (
                        <span className="text-sm text-destructive">
                            {errors.transNilaiPinjaman.message}
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor={register('transPersenTanggungan').name}>
                        Persen Tanggungan
                    </Label>
                    <div className="flex items-center gap-1">
                        <span className="flex items-center p-1.5 space-x-2 border bg-secondary rounded-md">
                            5%
                        </span>
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                Rp.
                            </span>
                            <Input
                                type="text"
                                id={register('transPersenTanggungan').name}
                                className={`pl-10 ${!isOverride ? 'text-muted-foreground' : ''}`}
                                readOnly={!isOverride}
                                {...register('transPersenTanggungan', {
                                    setValueAs: (value) =>
                                        value ? parseCurrency(value) : 0,
                                })}
                                value={
                                    watch('transPersenTanggungan')
                                        ? formatCurrency(
                                              watch('transPersenTanggungan'),
                                          )
                                        : ''
                                }
                                onChange={(e) => {
                                    if (isOverride) {
                                        const parsedValue = parseCurrency(
                                            e.target.value,
                                        );
                                        setValue(
                                            'transPersenTanggungan',
                                            parsedValue,
                                        );
                                    }
                                }}
                                onFocus={(e) => {
                                    if (isOverride) {
                                        const currentValue =
                                            watch('transPersenTanggungan') || 0;
                                        e.target.value =
                                            currentValue.toString();
                                    }
                                }}
                                onBlur={(e) => {
                                    if (
                                        isOverride &&
                                        watch('transPersenTanggungan')
                                    ) {
                                        e.target.value = formatCurrency(
                                            watch('transPersenTanggungan'),
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Toggle
                                variant={'outline'}
                                id="override-percent"
                                pressed={isOverride}
                                onPressedChange={(pressed) => {
                                    setIsOverride(pressed);
                                }}
                                className="ml-2"
                            >
                                <SquarePen />
                            </Toggle>
                        </div>
                    </div>
                    {errors.transPersenTanggungan && (
                        <span className="text-sm text-destructive">
                            {errors.transPersenTanggungan.message}
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label
                        className="mb-2"
                        htmlFor={register('transWaktuPinjam').name}
                    >
                        Waktu Peminjaman
                    </Label>
                    <div className="flex items-center gap-1">
                        <DateTimePicker
                            isDisabled={false}
                            selectedDate={transWaktuPinjamValue || new Date()} // When a user picks a custom time, disable the “now” toggle.
                            setSelectedDate={(date) => {
                                setValue('transWaktuPinjam', date);
                                setWaktuPinjamNow(false);
                            }}
                        />
                        {/* Toggle for "Now" */}
                        <Toggle
                            variant={'outline'}
                            pressed={waktuPinjamNow}
                            onPressedChange={(pressed) => {
                                setWaktuPinjamNow(pressed);
                                if (pressed) {
                                    setValue('transWaktuPinjam', new Date());
                                }
                            }}
                            className="ml-2"
                        >
                            <RefreshCw />
                        </Toggle>
                    </div>
                    {errors.transWaktuPinjam && (
                        <span className="text-sm text-destructive">
                            {errors.transWaktuPinjam.message}
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label
                        className="mb-2"
                        htmlFor={register('transType').name}
                    >
                        Tipe Transaksi
                    </Label>
                    <RadioGroup
                        value={watch('transType') || 'PAKAI'}
                        onValueChange={(value) => {
                            setValue('transType', value as TransactionType);
                        }}
                        className="flex space-x-4"
                    >
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="SIMPAN" />
                            <span className="font-normal">SIMPAN</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="PAKAI" />
                            <span className="font-normal">PAKAI</span>
                        </div>
                    </RadioGroup>
                    {errors.transType && (
                        <span className="text-sm text-destructive">
                            {errors.transType.message}
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label
                        className="mb-2"
                        htmlFor={register('transDuration').name}
                    >
                        Durasi Pinjam (bulan)
                    </Label>
                    <Input
                        type="number"
                        id={register('transDuration').name}
                        min={1}
                        {...register('transDuration', {
                            valueAsNumber: true,
                            validate: (value) =>
                                value >= 1 || 'Minimum 1 bulan',
                        })}
                    />
                    {errors.transDuration && (
                        <span className="text-sm text-destructive">
                            {errors.transDuration.message}
                        </span>
                    )}
                </div>

                {/* Jatuh Tempo Picker */}
                <div className="space-y-2">
                    <Label htmlFor={register('transJatuhTempo').name}>
                        Jatuh Tempo
                    </Label>
                    <div className="flex items-center gap-1">
                        <div
                            className={`relative flex-1 ${!isOverrideJatuhTempo ? 'text-muted-foreground' : ''}`}
                        >
                            <DateTimePicker
                                selectedDate={watch('transJatuhTempo')}
                                setSelectedDate={(date) => {
                                    setValue('transJatuhTempo', date);
                                    setIsOverrideJatuhTempo(true);
                                }}
                                isDisabled={!isOverrideJatuhTempo}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Toggle
                                variant={'outline'}
                                id="override-jatuh-tempo"
                                pressed={isOverrideJatuhTempo}
                                onPressedChange={(pressed) => {
                                    setIsOverrideJatuhTempo(pressed);
                                    if (!pressed) {
                                        // When override is turned off, recalculate the due date using the base date.
                                        const duration =
                                            watch('transDuration') || 1;
                                        const waktuPinjamValue =
                                            watch('transWaktuPinjam');
                                        const waktuPinjam = waktuPinjamValue
                                            ? new Date(waktuPinjamValue)
                                            : new Date();

                                        // Clone the waktuPinjam date to compute the new due date.
                                        const newJatuhTempo = new Date(
                                            waktuPinjam,
                                        );
                                        newJatuhTempo.setMonth(
                                            newJatuhTempo.getMonth() + duration,
                                        );

                                        setValue(
                                            'transJatuhTempo',
                                            newJatuhTempo,
                                        );
                                    }
                                }}
                                className="ml-2"
                            >
                                <Calendar className="h-4 w-4" />
                            </Toggle>
                        </div>
                    </div>
                    {errors.transJatuhTempo && (
                        <span className="text-sm text-destructive">
                            {errors.transJatuhTempo.message}
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor={register('transTanggunganAwal').name}>
                        Tanggungan Awal
                    </Label>
                    <div className="flex items-center gap-1">
                        <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                Rp.
                            </span>
                            <Input
                                type="text"
                                id={register('transTanggunganAwal').name}
                                className={`pl-10 text-muted-foreground`}
                                readOnly={true}
                                {...register('transTanggunganAwal', {
                                    setValueAs: (value) =>
                                        value ? parseCurrency(value) : 0,
                                })}
                                value={
                                    watch('transTanggunganAwal')
                                        ? formatCurrency(
                                              watch('transTanggunganAwal'),
                                          )
                                        : ''
                                }
                            />
                        </div>
                    </div>
                    {errors.transTanggunganAwal && (
                        <span className="text-sm text-destructive">
                            {errors.transTanggunganAwal.message}
                        </span>
                    )}
                </div>
                <div className="space-y-2">
                    <Label
                        className="mb-2"
                        htmlFor={register('transDesc').name}
                    >
                        Catatan Transaksi
                    </Label>
                    <Textarea
                        id={register('transDesc').name}
                        {...register('transDesc')}
                        placeholder="Masukkan catatan transaksi"
                        value={watch('transDesc') || ''}
                    />
                    {errors.transDesc && (
                        <span className="text-sm text-destructive">
                            {errors.transDesc.message}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};
export default TransactionStep;
