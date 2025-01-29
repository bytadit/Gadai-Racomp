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
import { useEffect } from 'react';
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
        brandOptions,
        selectedBrand,
        setSelectedBrand,
    } = useItemTableFilters();
    useEffect(() => {
        setSelectedYear(null);
    }, [typeFilter, setSelectedYear]);
    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(totalData / 10),
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
    });

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
                {yearOptions.length > 0 && (
                    <DataTableFilterBox
                        filterKey="year"
                        title="Year"
                        options={yearOptions.map((opt) => ({
                            value: opt.value.toString(), // Convert number to string
                            label: opt.value.toString(),
                            count: opt.count, // Pass the count from your data
                        }))}
                        setFilterValue={setSelectedYear}
                        filterValue={selectedYear}
                        isCountVisible={true}
                    />
                )}

                <DataTableFilterBox
                    filterKey="brand"
                    title="Brand"
                    options={brandOptions.map((opt) => ({
                        value: opt.value.toString(),
                        label: opt.value.toString(),
                        count: opt.count,
                    }))}
                    setFilterValue={setSelectedBrand}
                    filterValue={selectedBrand}
                    isCountVisible={true}
                />
            </div>

            <DataTable columns={columns} data={data} totalItems={totalData} />
        </div>
    );
}
