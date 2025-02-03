'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { ItemFormValues, itemSchema } from '@/lib/zod-schemas';
import { Label } from '@/components/ui/label';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { formatCurrency, parseCurrency } from '@/lib/utils';
import ItemCard from './item-card';
import { Item } from '@prisma/client';
import { SpokeSpinner } from '@/components/ui/spinner';
import Fuse from 'fuse.js';
// import { useDebouncedCallback } from 'use-debounce';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Plus, TriangleAlert, X } from 'lucide-react';
// import { toast } from 'sonner';

const ITEMS_PER_PAGE = 4; // Define the number of items per page
type ItemType = z.infer<typeof itemSchema>['itemType'];
const ItemStep = () => {
    const [isAddingItem, setIsAddingItem] = useState<boolean>(() => {
        const storedIsAddingItem = localStorage.getItem('isAddingItem');
        return storedIsAddingItem ? JSON.parse(storedIsAddingItem) : false;
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isSelecting, setIsSelecting] = useState<string | null>(null); // Track the selected card being in 'selecting' state
    const [barangs, setBarangs] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const {
        watch,
        setValue,
        register,
        reset,
        trigger,
        formState: { errors },
    } = useFormContext<ItemFormValues>();

    const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    const paginatedItems = filteredItems.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );
    const storedCustomerId = localStorage.getItem('customerId');
    const fetchItems = async () => {
        setIsLoading(true);
        try {
            let response;
            if (storedCustomerId !== null) {
                // Pass storedCustomerId as a query parameter
                response = await fetch(
                    `/api/items?storedCustomerId=${storedCustomerId}`,
                );
            } else {
                response = await fetch('/api/items');
            }
            if (!response.ok) {
                throw new Error('Failed to fetch items');
            }
            const data = await response.json();
            setBarangs(data);
            // Check localStorage for existing selected item
            const storedItem = localStorage.getItem('selectedItem');
            const storedItemId = localStorage.getItem('itemId');

            // Filter out selected item if exists
            setFilteredItems(
                storedItemId
                    ? data.filter((c: Item) => c.id.toString() !== storedItemId)
                    : data,
            );

            // If stored item exists, set it in state
            if (storedItem) {
                setSelectedItemId(JSON.parse(storedItem).id);
            }
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;
        setSearchQuery(value);
        // Get selected item ID from localStorage if exists
        const storedItemId = localStorage.getItem('itemId');
        if (value.length === 0) {
            // Show all items except selected one
            setFilteredItems(
                barangs.filter(
                    (barang) =>
                        !storedItemId || barang.id.toString() !== storedItemId,
                ),
            );
            setCurrentPage(1);
            return;
        }
        const fuse = new Fuse(barangs, {
            keys: ['name'],
            threshold: 0.3,
            isCaseSensitive: false,
        });
        const results = fuse.search(value);
        const items = results.map((result: { item: Item }) => result.item);
        setFilteredItems(
            items.filter(
                (item) => !storedItemId || item.id.toString() !== storedItemId,
            ),
        );
        setCurrentPage(1);
    };
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };
    const handleCardSelect = (newSelectedItemId: string) => {
        setIsSelecting(newSelectedItemId);
        setTimeout(() => {
            const storedItemId = localStorage.getItem('itemId');
            setSelectedItemId(newSelectedItemId);

            // Save to localStorage
            const selectedItem = barangs.find(
                (c) => c.id.toString() === newSelectedItemId,
            );
            if (selectedItem) {
                localStorage.setItem(
                    'selectedItem',
                    JSON.stringify(selectedItem),
                );
            }
            localStorage.setItem('itemId', newSelectedItemId);
            setFilteredItems(
                barangs.filter(
                    (barang) =>
                        !storedItemId || barang.id.toString() !== storedItemId,
                ),
            );
            setIsSelecting(null);
        }, 1500);
    };
    const handleAddItem = () => {
        setIsAddingItem(true);
        reset({
            itemName: '',
            itemType: 'KENDARAAN',
            itemYear: new Date().getFullYear(),
            itemValue: 0,
            itemBrand: '',
            itemSerial: '',
            itemDesc: '',
        });
        setSelectedItemId(null);
        localStorage.removeItem('itemId');
        localStorage.removeItem('selectedItem');
    };
    const handleCancelAddItem = () => {
        setIsAddingItem(false);
        reset({
            itemName: '',
            itemType: 'KENDARAAN',
            itemYear: new Date().getFullYear(),
            itemValue: 0,
            itemBrand: '',
            itemSerial: '',
            itemDesc: '',
        });
        setSearchQuery('');
        localStorage.setItem('itemId', '');
    };
    const selectedItemFromLocalStorage = localStorage.getItem('selectedItem');
    const selectedItem = selectedItemFromLocalStorage
        ? JSON.parse(selectedItemFromLocalStorage)
        : null;
    useEffect(() => {
        fetchItems();
    }, []);
    useEffect(() => {
        const itemId = localStorage.getItem('itemId');
        const savedItem = localStorage.getItem('selectedItem');
        if (itemId && itemId !== '') {
            setSelectedItemId(itemId);
        }
        if (savedItem) {
            const parsedItem = JSON.parse(savedItem);
            if (parsedItem && parsedItem.id) {
                setSelectedItemId(parsedItem.id);
            }
        }
    }, []);
    useEffect(() => {
        const itemId = localStorage.getItem('itemId');
        if (!isAddingItem && !itemId) {
            localStorage.setItem('itemId', '');
        }
        localStorage.setItem('isAddingItem', JSON.stringify(isAddingItem));
    }, [isAddingItem]);

    return (
        <div className="space-y-4 text-start">
            {isAddingItem ? (
                <>
                    <div className="text-end justify-end">
                        <Button
                            type="button"
                            onClick={handleCancelAddItem}
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
                                htmlFor={register('itemName').name}
                            >
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
                                htmlFor={register('itemType').name}
                            >
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
                                    <span className="font-normal">
                                        KENDARAAN
                                    </span>
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
                                        const cleanedValue = rawValue.replace(
                                            /-/g,
                                            '',
                                        );
                                        let part1 = '';
                                        let part2 = '';
                                        let part3 = '';
                                        let currentPart:
                                            | 'part1'
                                            | 'part2'
                                            | 'part3' = 'part1';

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
                                            } else if (
                                                currentPart === 'part2'
                                            ) {
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
                                            } else if (
                                                currentPart === 'part3'
                                            ) {
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
                            <Label
                                className="mb-2"
                                htmlFor={register('itemYear').name}
                            >
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
                                        const currentValue =
                                            watch('itemValue') || 0;
                                        e.target.value =
                                            currentValue.toString();
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
                        <Label
                            className="mb-2"
                            htmlFor={register('itemDesc').name}
                        >
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
                </>
            ) : (
                <>
                    <div>
                        <div className="text-end justify-end">
                            <Button onClick={handleAddItem} variant={'default'}>
                                <Plus className="h-4 w-4" />
                                Barang Baru
                            </Button>
                        </div>
                        {selectedItem && selectedItem.id && (
                            <div className="rounded-md my-4">
                                <Label className="text-sm">
                                    Barang Terpilih
                                </Label>
                                <ItemCard
                                    item={selectedItem}
                                    onClick={() => {}}
                                    isSelected={true}
                                />
                            </div>
                        )}
                        <div className="space-y-4">
                            <Label htmlFor="search">Cari Barang</Label>
                            <Input
                                id="search"
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Masukkan nama barang..."
                            />
                        </div>
                        {isLoading ? (
                            <div className="w-full min-h-[calc(90dvh-100px)] flex gap-2 mx-auto items-center justify-center">
                                <SpokeSpinner size="md" />
                                <span className="text-md font-medium text-muted-foreground">
                                    Memuat data barang...
                                </span>
                            </div>
                        ) : (
                            <div className="mt-4 space-y-4">
                                {paginatedItems.length > 0 ? (
                                    <div className="flex flex-col gap-4">
                                        <div className="grid grid-cols-2 gap-2">
                                            {paginatedItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="col-span-2 lg:col-span-1"
                                                >
                                                    <ItemCard
                                                        item={{
                                                            ...item,
                                                            value: item.value
                                                                ? Number(
                                                                      item.value.toString(),
                                                                  )
                                                                : 0,
                                                            year:
                                                                item.year ??
                                                                undefined,
                                                            desc:
                                                                item.desc ?? '',
                                                        }}
                                                        onClick={() =>
                                                            handleCardSelect(
                                                                item.id.toString(),
                                                            )
                                                        }
                                                        isSelecting={
                                                            isSelecting ===
                                                            item.id.toString()
                                                        }
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                        <Pagination>
                                            <PaginationContent>
                                                {/* Previous Button */}
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        size="default"
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

                                                {/* Page Numbers - Hidden on mobile */}
                                                <div className="hidden md:flex">
                                                    {Array.from(
                                                        { length: totalPages },
                                                        (_, index) => (
                                                            <PaginationItem
                                                                key={index}
                                                            >
                                                                <PaginationLink
                                                                    href="#"
                                                                    size="default"
                                                                    isActive={
                                                                        currentPage ===
                                                                        index +
                                                                            1
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
                                                </div>

                                                {/* Next Button */}
                                                <PaginationItem>
                                                    <PaginationNext
                                                        size="default"
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
                                            Data barang tidak ditemukan!
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
export default ItemStep;
