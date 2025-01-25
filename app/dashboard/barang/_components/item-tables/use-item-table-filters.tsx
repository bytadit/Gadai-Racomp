'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useEffect, useMemo, useState, useCallback } from 'react';
// import { getDistinctBrands, getItemDistinctYears } from '@/lib/utils';

export const TYPE_OPTIONS = [
    { value: 'KENDARAAN', label: 'Kendaraan' },
    { value: 'OTHER', label: 'Other' },
];
const fetchDistinctValues = async (tableName: string, columnName: string) => {
    const response = await fetch('/api/utils/get-distinct-values', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tableName, columnName }),
    });

    const data = await response.json();
    return data.distinctValues;
};

export function useItemTableFilters() {
    const [searchQuery, setSearchQuery] = useQueryState(
        'q',
        searchParams.q
            .withOptions({ shallow: false, throttleMs: 1000 })
            .withDefault(''),
    );

    const [yearOptions, setYearOptions] = useState<
        { value: number; label: string }[]
    >([]);

    const [selectedYear, setSelectedYear] = useQueryState(
        'year',
        searchParams.year.withOptions({ shallow: false }).withDefault(''),
    );

    useEffect(() => {
        async function fetchYears() {
            const years = await fetchDistinctValues('Item', 'year');
            const options = years.map((year: number | string) => ({
                value: year ?? 0,
                label: year?.toString() ?? 'No Year',
            }));
            setYearOptions(options);
        }
        fetchYears();
    }, []);

    const [typeFilter, setTypeFilter] = useQueryState(
        'type',
        searchParams.type.withOptions({ shallow: false }).withDefault(''),
    );
    const [brandFilter, setBrandFilter] = useQueryState(
        'brand',
        searchParams.brand.withOptions({ shallow: false }).withDefault(''),
    );

    const [page, setPage] = useQueryState(
        'page',
        searchParams.page.withDefault(1),
    );

    const resetFilters = useCallback(() => {
        setSearchQuery(null);
        setBrandFilter(null);
        setTypeFilter(null);
        setSelectedYear(null);
        setPage(1);
    }, [
        setSearchQuery,
        setTypeFilter,
        setBrandFilter,
        setPage,
        setSelectedYear,
    ]);

    const isAnyFilterActive = useMemo(() => {
        return !!searchQuery || !!selectedYear || !!typeFilter || !!brandFilter;
    }, [searchQuery, typeFilter, brandFilter, selectedYear]);

    const fetchBrandOptions = async () => {
        const brands = await fetchDistinctValues('Item', 'brand');
        return brands.map((brand: number | string) => ({
            value: brand,
            label: brand,
        }));
    };

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
        fetchBrandOptions,
        brandFilter,
        setBrandFilter,
    };
}
