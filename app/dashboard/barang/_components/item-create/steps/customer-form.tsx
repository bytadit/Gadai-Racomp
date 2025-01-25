'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { CustomerFormValues, customerSchema } from '../zodItemSchemas';
import DatePicker from '@/components/date-picker';
import { Label } from '@/components/ui/label';
import { usePhoneNumbers } from '../hooks/useNewPhoneNumbers';
import { CircleCheckBig, Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useDebouncedCallback } from 'use-debounce';
import CustomerCard from './customer-card';
import { Customer } from '@prisma/client';

type GenderType = z.infer<typeof customerSchema>['gender'];

const CustomerStep = () => {
    const [isAddingCustomer, setIsAddingCustomer] = useState<boolean>(() => {
        const storedIsAddingCustomer = localStorage.getItem('isAddingCustomer');
        return storedIsAddingCustomer
            ? JSON.parse(storedIsAddingCustomer)
            : false;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
        null,
    );
    const [isSelecting, setIsSelecting] = useState<string | null>(null); // Track the selected card being in 'selecting' state
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const {
        watch,
        setValue,
        register,
        reset,
        formState: { errors },
    } = useFormContext<CustomerFormValues>();
    const {
        phoneNumbers,
        handlePhoneChange,
        handleAddPhone,
        handleRemovePhone,
        handleSetActive,
        handleSetWhatsapp,
    } = usePhoneNumbers({
        watch,
        setValue,
    });
    const fetchCustomers = async (query = '') => {
        setIsLoading(true);
        try {
            const url = query
                ? `/api/customers/search?query=${query}`
                : `/api/customers`; // Fetch all customers if query is empty
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSearch = useDebouncedCallback((query) => {
        fetchCustomers(query);
    }, 300);
    const handleCardSelect = (selectedCustomerId: string) => {
        setIsSelecting(selectedCustomerId);
        setTimeout(() => {
            setSelectedCustomerId(selectedCustomerId);
            localStorage.setItem('customerId', selectedCustomerId);
            setIsSelecting(null);
        }, 1000);
    };
    const handleAddCustomer = () => {
        setIsAddingCustomer(true);
        reset({
            name: '',
            nik: '',
            birthdate: new Date(),
            status: 'AMAN',
            gender: 'PRIA',
            address: '',
            desc: '',
            phone_numbers: [{ phone_number: '' }],
        });
        setSelectedCustomerId(null);
        localStorage.removeItem('customerId');
    };
    const handleCancelAddCustomer = () => {
        setIsAddingCustomer(false);
        reset({
            name: '',
            nik: '',
            birthdate: new Date(),
            status: 'AMAN',
            gender: 'PRIA',
            address: '',
            desc: '',
            phone_numbers: [{ phone_number: '' }],
        });
        setSearchQuery('');
        localStorage.setItem('customerId', '');
    };

    const filteredCustomers = customers.filter(
        (customer) => customer.id.toString() !== selectedCustomerId,
    );
    useEffect(() => {
        fetchCustomers();
    }, []);
    useEffect(() => {
        const customerId = localStorage.getItem('customerId');
        if (customerId && customerId !== '') {
            setSelectedCustomerId(customerId);
        }
    }, []);

    useEffect(() => {
        const customerId = localStorage.getItem('customerId');
        if (!isAddingCustomer && !customerId) {
            localStorage.setItem('customerId', '');
        }
        localStorage.setItem(
            'isAddingCustomer',
            JSON.stringify(isAddingCustomer),
        );
    }, [isAddingCustomer]);

    return (
        <div className="space-y-4 text-start">
            {isAddingCustomer ? (
                <>
                    <Button type="button" onClick={handleCancelAddCustomer}>
                        Batal
                    </Button>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 mt-6">
                        <div className="space-y-2">
                            <Label
                                className="mb-2"
                                htmlFor={register('name').name}
                            >
                                Nama Pelanggan
                            </Label>
                            <Input
                                id={register('name').name}
                                {...register('name')}
                                value={watch('name') || ''}
                            />
                            {errors.name && (
                                <span className="text-sm text-destructive">
                                    {errors.name.message}
                                </span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label
                                className="mb-2"
                                htmlFor={register('nik').name}
                            >
                                NIK
                            </Label>
                            <Input
                                id={register('nik').name}
                                {...register('nik')}
                                value={watch('nik') || ''}
                            />
                            {errors.nik && (
                                <span className="text-sm text-destructive">
                                    {errors.nik.message}
                                </span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label
                                className="mb-2"
                                htmlFor={register('birthdate').name}
                            >
                                Tanggal Lahir
                            </Label>
                            <DatePicker
                                selectedDate={watch('birthdate') || new Date()}
                                setSelectedDate={(date) =>
                                    setValue('birthdate', date as Date)
                                }
                            />
                            {errors.birthdate && (
                                <span className="text-sm text-destructive">
                                    {errors.birthdate.message}
                                </span>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            {/* Status */}
                            <div className="space-y-2">
                                <Label
                                    className="mb-2"
                                    htmlFor={register('status').name}
                                >
                                    Status Pelanggan
                                </Label>
                                <select
                                    id={register('status').name}
                                    {...register('status', {
                                        required: 'Status is required',
                                    })}
                                    className="w-full rounded-md border px-3 py-2 text-sm bg-secondary focus:outline-none focus:ring-1 focus:ring-primary focus:ring-opacity-50"
                                    defaultValue={watch('status') || 'AMAN'}
                                >
                                    <option value="" disabled>
                                        Pilih status
                                    </option>
                                    <option value="AMAN">Aman</option>
                                    <option value="FAVORIT">Favorit</option>
                                    <option value="RISIKO">Risiko</option>
                                    <option value="MASALAH">Masalah</option>
                                </select>
                                {errors.status && (
                                    <span className="text-sm text-destructive">
                                        {errors.status.message}
                                    </span>
                                )}
                            </div>

                            {/* Gender */}
                            <div className="space-y-2">
                                <Label
                                    className="mb-2"
                                    htmlFor={register('gender').name}
                                >
                                    Jenis Kelamin
                                </Label>
                                <RadioGroup
                                    value={watch('gender') || 'PRIA'}
                                    onValueChange={(value) =>
                                        setValue('gender', value as GenderType)
                                    }
                                    className="flex space-x-4"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="PRIA" />
                                        <span className="font-normal">
                                            Pria
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="WANITA" />
                                        <span className="font-normal">
                                            Wanita
                                        </span>
                                    </div>
                                </RadioGroup>
                                {errors.gender && (
                                    <span className="text-sm text-destructive">
                                        {errors.gender.message}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label
                                className="mb-2"
                                htmlFor={register('address').name}
                            >
                                Alamat Pelanggan
                            </Label>
                            <Textarea
                                id={register('address').name}
                                {...register('address')}
                                placeholder="Masukkan alamat pelanggan"
                                value={watch('address') || ''}
                            />
                            {errors.address && (
                                <span className="text-sm text-destructive">
                                    {errors.address.message}
                                </span>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label
                                className="mb-2"
                                htmlFor={register('desc').name}
                            >
                                Catatan Pelanggan
                            </Label>
                            <Textarea
                                id={register('desc').name}
                                {...register('desc')}
                                value={watch('desc') || ''}
                                placeholder="Masukkan catatan pelanggan"
                            />
                            {errors.desc && (
                                <span className="text-sm text-destructive">
                                    {errors.desc.message}
                                </span>
                            )}
                        </div>
                        <div className="w-full items-center">
                            <Label className="mb-2" htmlFor="phone_number">
                                Nomor Telepon
                            </Label>
                            {phoneNumbers.map((phone, index) => (
                                <div
                                    className="flex flex-col gap-2"
                                    key={index}
                                >
                                    <div className="grid grid-cols-8 gap-1 mt-4">
                                        <div className="flex flex-row gap-1 items-center col-span-2">
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    handleSetActive(index)
                                                }
                                                className={cn(
                                                    'text-xs px-2 py-1.5 w-full',
                                                    phone.is_active
                                                        ? 'text-white'
                                                        : 'text-dark dark:text-white',
                                                )}
                                                variant={
                                                    phone.is_active
                                                        ? 'success'
                                                        : 'outline'
                                                }
                                            >
                                                {phone.is_active ? (
                                                    <CircleCheckBig
                                                        color="white"
                                                        size={16}
                                                    />
                                                ) : (
                                                    ''
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                className={cn(
                                                    'text-xs px-2 py-1.5 w-full',
                                                    phone.is_whatsapp
                                                        ? 'text-white'
                                                        : 'text-dark dark:text-white',
                                                )}
                                                onClick={() =>
                                                    handleSetWhatsapp(index)
                                                }
                                                variant={
                                                    phone.is_whatsapp
                                                        ? 'whatsapp'
                                                        : 'outline'
                                                }
                                            >
                                                {phone.is_whatsapp ? (
                                                    <FaWhatsapp
                                                        color="white"
                                                        size={16}
                                                    />
                                                ) : (
                                                    ''
                                                )}
                                            </Button>
                                        </div>
                                        <Input
                                            className="col-span-5"
                                            type="text"
                                            placeholder="Nomor telepon..."
                                            value={phone.phone_number || ''}
                                            {...register(
                                                `phone_numbers.${index}.phone_number`,
                                                {
                                                    onChange: (e) =>
                                                        handlePhoneChange(
                                                            index,
                                                            e.target.value,
                                                        ),
                                                },
                                            )}
                                        />

                                        <div className="col-span-1">
                                            {index > 0 ? (
                                                <Button
                                                    type="button"
                                                    className="px-2 py-1.5 w-full"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        handleRemovePhone(index)
                                                    }
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            ) : (
                                                <Button
                                                    className="px-2 py-1.5 w-full"
                                                    type="button"
                                                    onClick={handleAddPhone}
                                                >
                                                    <Plus size={16} />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                    {errors.phone_numbers?.[index]
                                        ?.phone_number && (
                                        <p className="text-destructive text-xs font-semibold">
                                            {
                                                errors.phone_numbers[index]
                                                    .phone_number.message
                                            }
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div>
                        <div>
                            <Button onClick={handleAddCustomer}>
                                Tambah Customer
                            </Button>
                        </div>
                        <div className="space-y-4">
                            <Label htmlFor="search">Search for Customer</Label>
                            <Input
                                id="search"
                                value={searchQuery}
                                onChange={(e) => {
                                    const query = e.target.value;
                                    setSearchQuery(query);
                                    handleSearch(query);
                                }}
                                placeholder="Search customers"
                            />
                        </div>
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {selectedCustomerId && (
                                    <div className="p-4 rounded-md mb-4">
                                        <h3 className="font-semibold">
                                            Selected Customer
                                        </h3>
                                        <CustomerCard
                                            customer={
                                                customers.find(
                                                    (customer) =>
                                                        customer.id.toString() ===
                                                        selectedCustomerId,
                                                )!
                                            }
                                            onClick={() => {}}
                                            isSelected={true}
                                        />
                                    </div>
                                )}
                                {filteredCustomers.length > 0 ? (
                                    filteredCustomers.map((customer) => (
                                        <CustomerCard
                                            key={customer.id}
                                            customer={customer}
                                            onClick={() =>
                                                handleCardSelect(
                                                    customer.id.toString(),
                                                )
                                            }
                                            isSelecting={
                                                isSelecting ===
                                                customer.id.toString()
                                            }
                                        />
                                    ))
                                ) : (
                                    <p>No customers found.</p>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default CustomerStep;
