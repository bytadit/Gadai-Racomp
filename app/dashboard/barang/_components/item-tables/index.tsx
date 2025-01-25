'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
// import { Employee } from '@/constants/data';
import { Item, Customer } from '@prisma/client';
import { columns } from '../item-tables/columns';
import { Download } from 'lucide-react';
import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import { TYPE_OPTIONS, useItemTableFilters } from './use-item-table-filters';
import { useEffect, useState } from 'react';
type ItemWithCustomer = Item & {
    customer: Customer | null; // Related customer can be null if not present
};
export default function ItemTable({
    data,
    totalData,
}: {
    data: ItemWithCustomer[];
    totalData: number;
}) {
    const {
        searchQuery,
        setSearchQuery,
        resetFilters,
        setPage,
        isAnyFilterActive,
        typeFilter,
        setTypeFilter,
        yearOptions,
        selectedYear,
        setSelectedYear,
        fetchBrandOptions,
        brandFilter,
        setBrandFilter,
    } = useItemTableFilters();
    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(totalData / 10),
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
    });

    const [brandOptions, setBrandOptions] = useState<
        { value: string; label: string }[]
    >([]);
    useEffect(() => {
        const loadBrands = async () => {
            const options = await fetchBrandOptions();
            setBrandOptions(options);
        };
        loadBrands();
    }, [fetchBrandOptions]);

    const yearOptionsStr = yearOptions.map((year) => ({
        value: year.toString(), // Convert year to a string
        label: year.toString(), // Optionally, you can also use 'year' as a label
    }));

    return (
        <div className="space-y-2">
            <div className="flex flex-row justify-between gap-2">
                <DataTableSearch
                    searchKey="name"
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setPage={setPage}
                />
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        exportTableToCSV(table, {
                            filename: 'items',
                            excludeColumns: ['no', 'select', 'actions'],
                        })
                    }
                    className="gap-2 h-9"
                >
                    <span className="text-sm hidden sm:block">Export</span>{' '}
                    <Download className="size-4" aria-hidden="true" />
                </Button>
            </div>

            <div className="flex items-center flex-wrap justify-start gap-4">
                <DataTableResetFilter
                    isFilterActive={isAnyFilterActive}
                    onReset={resetFilters}
                    classname="order-1"
                />
                <DataTableFilterBox
                    filterKey="type"
                    title="Item Type"
                    options={TYPE_OPTIONS}
                    setFilterValue={setTypeFilter}
                    filterValue={typeFilter}
                />
                {/* Year Filter */}
                <DataTableFilterBox
                    filterKey="year"
                    title="Year"
                    options={yearOptionsStr}
                    setFilterValue={setSelectedYear}
                    filterValue={selectedYear}
                />

                {/* Brand Filter */}
                <DataTableFilterBox
                    filterKey="brand"
                    title="Brand"
                    options={brandOptions}
                    setFilterValue={setBrandFilter}
                    filterValue={brandFilter}
                />
            </div>

            <DataTable columns={columns} data={data} totalItems={totalData} />
        </div>
    );
}
