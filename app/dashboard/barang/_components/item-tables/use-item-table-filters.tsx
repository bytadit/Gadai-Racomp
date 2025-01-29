'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useEffect, useMemo, useState, useCallback } from 'react';

export const TYPE_OPTIONS = [
    { value: 'KENDARAAN', label: 'Kendaraan' },
    { value: 'OTHER', label: 'Other' },
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
    }, [typeFilter]); // Add other filter dependencies here

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
    }, [typeFilter, selectedYear]); // Add other filter dependencies here

    useEffect(() => {
        fetchBrands();
    }, [fetchBrands]);

    // Add effect to reset brand filter when other filters change
    useEffect(() => {
        setSelectedBrand(null);
    }, [typeFilter, selectedYear, setSelectedBrand]);

    const resetFilters = useCallback(() => {
        setSearchQuery(null);
        setSelectedBrand(null);
        setTypeFilter(null);
        setSelectedYear(null);
        setPage(1);
    }, [
        setSearchQuery,
        setTypeFilter,
        setSelectedBrand,
        setPage,
        setSelectedYear,
    ]);

    const isAnyFilterActive = useMemo(() => {
        return (
            !!searchQuery || !!selectedYear || !!typeFilter || !!selectedBrand
        );
    }, [searchQuery, typeFilter, selectedBrand, selectedYear]);


    return {
        searchQuery,
        setSearchQuery,
        page,
        setPage,
        resetFilters,
        isAnyFilterActive,
        typeFilter,
        setTypeFilter,
        yearOptions,
        selectedYear,
        setSelectedYear,
        brandOptions,
        selectedBrand,
        setSelectedBrand,
        fetchBrands,
    };
}
