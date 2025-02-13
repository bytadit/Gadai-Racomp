'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useEffect, useMemo, useState, useCallback } from 'react';

export const TYPE_OPTIONS = [
    { value: 'KENDARAAN', label: 'Kendaraan' },
    { value: 'OTHER', label: 'Other' },
];
export const ITEM_STATUS_OPTIONS = [
    { value: 'MASUK', label: 'Masuk' },
    { value: 'KELUAR', label: 'Keluar' },
    { value: 'DIJUAL', label: 'Dijual' },
];


export function useItemTableFilters() {
    const [searchQuery, setSearchQuery] = useQueryState(
        'q',
        searchParams.q
            .withOptions({ shallow: false, throttleMs: 1000 })
            .withDefault(''),
    );

    const [yearOptions, setYearOptions] = useState<
        { value: number; label: string; count: number }[]
    >([]);

    const [selectedYear, setSelectedYear] = useQueryState(
        'year',
        searchParams.year.withOptions({ shallow: false }).withDefault(''),
    );
    const [brandOptions, setBrandOptions] = useState<
        { value: string; label: string; count: number }[]
    >([]);

    const [selectedBrand, setSelectedBrand] = useQueryState(
        'brand',
        searchParams.brand.withOptions({ shallow: false }).withDefault(''),
    );

    const [typeFilter, setTypeFilter] = useQueryState(
        'type',
        searchParams.type.withOptions({ shallow: false }).withDefault(''),
    );
    const [item_statusFilter, setItem_statusFilter] = useQueryState(
        'item_status',
        searchParams.item_status.withOptions({ shallow: false }).withDefault(''),
    );

    const [page, setPage] = useQueryState(
        'page',
        searchParams.page.withDefault(1),
    );
    const fetchYears = useCallback(async () => {
        try {
            const response = await fetch('/api/utils/get-distinct-values', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tableName: 'Item',
                    columnName: 'year',
                    filters: {
                        type: typeFilter,
                        item_status: item_statusFilter
                        // Add other active filters here
                    },
                }),
            });

            const { data } = await response.json();

            const options = data
                .filter((entry: { value: any }) => entry.value !== null)
                .sort(
                    (a: { value: number }, b: { value: number }) =>
                        b.value - a.value,
                )
                .map((entry: { value: number; count: number }) => ({
                    value: entry.value.toString(),
                    label: entry.value.toString(),
                    count: entry.count,
                    rawValue: entry.value,
                }));

            setYearOptions(options);
        } catch (error) {
            console.error('Failed to fetch years:', error);
            setYearOptions([]);
        }
    }, [typeFilter, item_statusFilter]); // Add other filter dependencies here

    useEffect(() => {
        fetchYears();
    }, [fetchYears]);

    const fetchBrands = useCallback(async () => {
        try {
            const response = await fetch('/api/utils/get-distinct-values', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tableName: 'Item',
                    columnName: 'brand',
                    filters: {
                        type: typeFilter,
                        item_status: item_statusFilter,
                        year: selectedYear,
                        // Add other active filters here
                    },
                }),
            });

            const { data } = await response.json();

            const options = data
                .filter((entry: { value: any }) => entry.value !== null)
                .sort(
                    (a: { value: number }, b: { value: number }) =>
                        b.value - a.value,
                )
                .map((entry: { value: number; count: number }) => ({
                    value: entry.value.toString(),
                    label: entry.value.toString(),
                    count: entry.count,
                    rawValue: entry.value,
                }));

            setBrandOptions(options);
        } catch (error) {
            console.error('Failed to fetch brands:', error);
            setBrandOptions([]);
        }
    }, [typeFilter, item_statusFilter, selectedYear]); // Add other filter dependencies here

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    // Add effect to reset brand filter when other filters change
    useEffect(() => {
        setSelectedBrand(null);
    }, [typeFilter, item_statusFilter, selectedYear, setSelectedBrand]);

    const resetFilters = useCallback(() => {
        setSearchQuery(null);
        setSelectedBrand(null);
        setTypeFilter(null);
        setItem_statusFilter(null);
        setSelectedYear(null);
        setPage(1);
    }, [
        setSearchQuery,
        setTypeFilter,
        setItem_statusFilter,
        setSelectedBrand,
        setPage,
        setSelectedYear,
    ]);

    const isAnyFilterActive = useMemo(() => {
        return (
            !!searchQuery || !!selectedYear || !!typeFilter || !!item_statusFilter || !!selectedBrand
        );
    }, [searchQuery, typeFilter, item_statusFilter, selectedBrand, selectedYear]);


    return {
        searchQuery,
        setSearchQuery,
        page,
        setPage,
        resetFilters,
        isAnyFilterActive,
        typeFilter,
        item_statusFilter,
        setTypeFilter,
        setItem_statusFilter,
        yearOptions,
        selectedYear,
        setSelectedYear,
        brandOptions,
        selectedBrand,
        setSelectedBrand,
        fetchBrands,
    };
}
