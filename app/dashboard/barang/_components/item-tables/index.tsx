'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { useEffect, useState } from 'react';
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
import {
    TYPE_OPTIONS,
    ITEM_STATUS_OPTIONS,
    useItemTableFilters,
} from './use-item-table-filters';
import { SelectionPopup } from '@/components/selection-popup';
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
        item_statusFilter,
        setItem_statusFilter,
        yearOptions,
        selectedYear,
        setSelectedYear,
        brandOptions,
        selectedBrand,
        setSelectedBrand,
    } = useItemTableFilters();
    useEffect(() => {
        setSelectedYear(null);
    }, [typeFilter, item_statusFilter, setSelectedYear]);
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(totalData / 10),
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualFiltering: true,
        enableRowSelection: true, // Enable row selection
        state: {
            rowSelection,
        },
        onRowSelectionChange: setRowSelection,
    });
    const selectedRows = table.getSelectedRowModel().rows;

    useEffect(() => {
        console.log('Row Selection:', rowSelection);
        console.log('Selected Rows:', table.getSelectedRowModel().rows);
    }, [rowSelection]);

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
            <div className="flex items-center flex-wrap justify-start gap-2">
                <DataTableResetFilter
                    isFilterActive={isAnyFilterActive}
                    onReset={resetFilters}
                    classname="order-1 text-xs"
                />
                <DataTableFilterBox
                    filterKey="type"
                    title="Tipe"
                    options={TYPE_OPTIONS}
                    setFilterValue={setTypeFilter}
                    filterValue={typeFilter}
                />
                <DataTableFilterBox
                    filterKey="item_status"
                    title="Status"
                    options={ITEM_STATUS_OPTIONS}
                    setFilterValue={setItem_statusFilter}
                    filterValue={item_statusFilter}
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
            {Object.keys(rowSelection).length > 0 && (
                <SelectionPopup
                    selectedRows={selectedRows}
                    onDeleteSuccess={() => {
                        setRowSelection({});
                        // Add any additional refresh logic here
                    }}
                />
            )}{' '}
        </div>
    );
}
