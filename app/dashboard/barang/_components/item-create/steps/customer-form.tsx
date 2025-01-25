'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { CustomerFormValues, customerSchema } from '../zodItemSchemas';
import DatePicker from '@/components/date-picker';
import { Label } from '@/components/ui/label';
import { usePhoneNumbers } from '../hooks/useNewPhoneNumbers';
import { CircleCheckBig, Plus, Trash2, TriangleAlert, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FaWhatsapp } from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useDebouncedCallback } from 'use-debounce';
import CustomerCard from './customer-card';
import { Customer } from '@prisma/client';
import { SpokeSpinner } from '@/components/ui/spinner';
import Fuse from 'fuse.js';

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

type GenderType = z.infer<typeof customerSchema>['gender'];
const ITEMS_PER_PAGE = 4; // Define the number of items per page

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
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

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
    // const fetchCustomers = async (query = '') => {
    //     setIsLoading(true);
    //     try {
    //         const url = query
    //             ? `/api/customers/search?query=${query}`
    //             : `/api/customers`; // Fetch all customers if query is empty
    //         const response = await fetch(url);
    //         if (!response.ok) {
    //             throw new Error('Failed to fetch customers');
    //         }
    //         const data = await response.json();
    //         setCustomers(data);
    //     } catch (error) {
    //         console.error('Error fetching customers:', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const fetchCustomers = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/customers');
            if (!response.ok) {
                throw new Error('Failed to fetch customers');
            }
            const data = await response.json();
            setCustomers(data);
            setFilteredCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchCustomers();
    }, []);

    // const fuse = new Fuse(customers, {
    //     keys: ['name'], // keys to search within the customer object
    //     includeScore: true, // Optional: Include the search score in the results
    //     isCaseSensitive: false,
    // });

    // const handleSearch = useDebouncedCallback((query) => {
    //     fetchCustomers(query);
    // }, 300);

    // const handleSearch = useDebouncedCallback((query: string) => {
    //     setSearchQuery(query);
    //     if (query === '') {
    //         setFilteredCustomers(customers); // If empty, show all customers
    //     } else {
    //         const results = fuse.search(query);
    //         const items = results.map((result) => result.item);
    //         setFilteredCustomers(items);
    //     }
    // }, 300); // Debounce for 300ms

    // Perform search filtering when query changes
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setSearchQuery(value);

        if (value.length === 0) {
            // If search input is empty, show all customers
            setFilteredCustomers(customers);
            setCurrentPage(1); // Reset to the first page

            return;
        }

        const fuse = new Fuse(customers, {
            keys: ['name'],
            threshold: 0.3, // Adjust threshold for better results
            isCaseSensitive: false,
        });

        const results = fuse.search(value);
        const items = results.map((result) => result.item);
        setFilteredCustomers(items);
        setCurrentPage(1); // Reset to the first page after search
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
    const paginatedCustomers = filteredCustomers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );
    const handleCardSelect = (selectedCustomerId: string) => {
        setIsSelecting(selectedCustomerId);
        setTimeout(() => {
            setSelectedCustomerId(selectedCustomerId);
            // Save selected customer data to localStorage
            const selectedCustomer = customers.find(
                (customer) => customer.id.toString() === selectedCustomerId,
            );
            if (selectedCustomer) {
                localStorage.setItem(
                    'selectedCustomer',
                    JSON.stringify(selectedCustomer),
                );
            }
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
        localStorage.removeItem('selectedCustomer');
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

    // const filteredCustomers = customers.filter(
    //     (customer) => customer.id.toString() !== selectedCustomerId,
    // );

    useEffect(() => {
        const customerId = localStorage.getItem('customerId');
        const savedCustomer = localStorage.getItem('selectedCustomer');

        if (customerId && customerId !== '') {
            setSelectedCustomerId(customerId);
        }
        if (savedCustomer) {
            // If selected customer data exists in localStorage, use it
            const parsedCustomer = JSON.parse(savedCustomer);
            if (parsedCustomer && parsedCustomer.id) {
                setSelectedCustomerId(parsedCustomer.id);
            }
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

    const selectedCustomerFromLocalStorage =
        localStorage.getItem('selectedCustomer');
    const selectedCustomer = selectedCustomerFromLocalStorage
        ? JSON.parse(selectedCustomerFromLocalStorage)
        : null;

    return (
        <div className="space-y-4 text-start">
            {isAddingCustomer ? (
                <>
                    <div className="text-end justify-end">
                        <Button
                            type="button"
                            onClick={handleCancelAddCustomer}
                            variant={'default'}
                        >
                            <X className="h-4 w-4" />
                            Batal
                        </Button>
                    </div>
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
                        <div className="text-end justify-end">
                            <Button
                                onClick={handleAddCustomer}
                                variant={'default'}
                            >
                                <Plus className="h-4 w-4" />
                                Pelanggan Baru
                            </Button>
                        </div>
                        {selectedCustomer && selectedCustomer.id && (
                            <div className="rounded-md my-4">
                                <Label className="text-sm">
                                    Pelanggan Terpilih
                                </Label>
                                <CustomerCard
                                    customer={selectedCustomer}
                                    onClick={() => {}}
                                    isSelected={true}
                                />
                            </div>
                        )}
                        <div className="space-y-4">
                            <Label htmlFor="search">Cari Pelanggan</Label>
                            <Input
                                id="search"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Masukkan nama pelanggan..."
                            />
                        </div>
                        {isLoading ? (
                            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                                <SpokeSpinner size="md" />
                                <span className="text-md font-medium text-muted-foreground">
                                    Memuat data pelanggan...
                                </span>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {paginatedCustomers.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-4 gap-2">
                                            {paginatedCustomers.map(
                                                (customer) => (
                                                    <div
                                                        key={customer.id}
                                                        className="col-span-4 md:col-span-2 lg:col-span-1"
                                                    >
                                                        <CustomerCard
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
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        size={'default'}
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (currentPage > 1)
                                                                handlePageChange(
                                                                    currentPage -
                                                                        1,
                                                                );
                                                        }}
                                                    />
                                                </PaginationItem>
                                                {Array.from(
                                                    { length: totalPages },
                                                    (_, index) => (
                                                        <PaginationItem
                                                            key={index}
                                                        >
                                                            <PaginationLink
                                                                href="#"
                                                                size={'default'}
                                                                isActive={
                                                                    currentPage ===
                                                                    index + 1
                                                                }
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.preventDefault();
                                                                    handlePageChange(
                                                                        index +
                                                                            1,
                                                                    );
                                                                }}
                                                            >
                                                                {index + 1}
                                                            </PaginationLink>
                                                        </PaginationItem>
                                                    ),
                                                )}
                                                <PaginationItem>
                                                    <PaginationNext
                                                        size={'default'}
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (
                                                                currentPage <
                                                                totalPages
                                                            )
                                                                handlePageChange(
                                                                    currentPage +
                                                                        1,
                                                                );
                                                        }}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                ) : (
                                    <div className="w-full min-h-[calc(90dvh-100px)] flex flex-row gap-2 mx-auto items-center justify-center">
                                        <TriangleAlert />
                                        <span className="text-md font-medium text-muted-foreground">
                                            Data pelanggan tidak ditemukan!
                                        </span>
                                    </div>
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
