'use client';

import { DataTable } from '@/components/ui/table/data-table';
import { DataTableFilterBox } from '@/components/ui/table/data-table-filter-box';
import { DataTableResetFilter } from '@/components/ui/table/data-table-reset-filter';
// import { DataTableSearch } from '@/components/ui/table/data-table-search';
import { getCoreRowModel, useReactTable } from '@tanstack/react-table';
// import { Employee } from '@/constants/data';
import { CashFlow, Transaction } from '@prisma/client';
import { columns } from '../cashflow-tables/columns';
import { Download } from 'lucide-react';
import { exportTableToCSV } from '@/lib/export';
import { Button } from '@/components/ui/button';
import {
    PAYMENT_TYPE_OPTIONS,
    useCashflowTableFilters,
} from './use-cashflow-table-filters';

type CashflowWithTransaction = CashFlow & {
    transaction: Transaction | null;
};
export default function CashflowTable({
    data,
    totalData,
}: {
    data: CashflowWithTransaction[];
    totalData: number;
}) {
    const {
        paymentTypeFilter,
        setPaymentTypeFilter,
        isAnyFilterActive,
        resetFilters,
        // searchQuery,
        // setPage,
        // setSearchQuery,
    } = useCashflowTableFilters();
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
                {/* <DataTableSearch
                    searchKey="name"
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    setPage={setPage}
                /> */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                        exportTableToCSV(table, {
                            filename: 'cashflow',
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
                    title="Tipe Bayar"
                    options={PAYMENT_TYPE_OPTIONS}
                    setFilterValue={setPaymentTypeFilter}
                    filterValue={paymentTypeFilter}
                />
            </div>
            <DataTable columns={columns} data={data} totalItems={totalData} />
        </div>
    );
}
