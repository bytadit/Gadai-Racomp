'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
// import { Employee } from '@/constants/data';
import { Item, Transaction } from '@prisma/client';
import { columns } from '../transaction-tables/columns';
import { Download } from 'lucide-react';
import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import {
    TYPE_OPTIONS,
    STATUS_CICILAN,
    STATUS_TRANSAKSI,
    useTransactionTableFilters,
} from './use-transaction-table-filters';

type TransactionWithItem = Transaction & {
    item: Item | null;
};
export default function TransactionTable({
    data,
    totalData,
}: {
    data: TransactionWithItem[];
    totalData: number;
}) {
    const {
        typeFilter,
        statusCicilanFilter,
        statusTransaksiFilter,
        setTypeFilter,
        setStatusCicilanFilter,
        setStatusTransaksiFilter,
        isAnyFilterActive,
        resetFilters,
        searchQuery,
        setPage,
        setSearchQuery,
    } = useTransactionTableFilters();
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
                            filename: 'transactions',
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
                    title="Tipe Transaksi"
                    options={TYPE_OPTIONS}
                    setFilterValue={setTypeFilter}
                    filterValue={typeFilter}
                />
                <DataTableFilterBox
                    filterKey="status_transaksi"
                    title="Status Transaksi"
                    options={STATUS_TRANSAKSI}
                    setFilterValue={setStatusTransaksiFilter}
                    filterValue={statusTransaksiFilter}
                />
                <DataTableFilterBox
                    filterKey="status_cicilan"
                    title="Status Cicilan"
                    options={STATUS_CICILAN}
                    setFilterValue={setStatusCicilanFilter}
                    filterValue={statusCicilanFilter}
                />
            </div>
            <DataTable columns={columns} data={data} totalItems={totalData} />
        </div>
    );
}
