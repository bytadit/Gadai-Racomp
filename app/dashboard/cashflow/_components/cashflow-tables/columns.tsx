'use client';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { CashFlow, Item, Transaction } from '@prisma/client';
import { cn, formatDate, formatToIndonesianCurrency } from '@/lib/utils';
import { ArrowUpDown } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
type TransactionWithItem = Transaction & {
    item: Item | null;
};
type CashflowWithTransaction = CashFlow & {
    transaction: TransactionWithItem | null;
};
export const columns: ColumnDef<CashflowWithTransaction>[] = [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Pilih semua"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                disabled={!row.getCanSelect()}
                aria-label="Pilih"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        id: 'no',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    size={'sm'}
                    className="p-2 w-full text-left flex flex-row justify-between"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    <ArrowUpDown className="h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row, table }) => {
            const pageSize = table.getState().pagination.pageSize;
            const pageIndex = table.getState().pagination.pageIndex;
            return (
                <span className="pl-2">
                    {pageIndex * pageSize + row.index + 1}
                </span>
            );
        },
    },
    {
        accessorKey: 'transactionId',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    size={'sm'}
                    className="p-2 w-full text-left flex flex-row justify-between"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    TRANSAKSI
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const transaction = row.original.transaction;
            console.log(transaction);
            return (
                <a
                    href={`/dashboard/transaksi/${transaction?.id}`}
                    className={cn(
                        'text-left text-xs',
                        buttonVariants({ variant: 'ghost', size: 'sm' }),
                    )}
                >
                    {formatDate(transaction?.waktu_pinjam?.toString()) ||
                        'Unknown'}
                    {/* {transaction?.item?.name || 'No Item Name'} */}
                    {/* add item name here */}
                </a>
            );
        },
    },
    {
        accessorKey: 'termin',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    size={'sm'}
                    className="p-2 w-full text-left justify-start"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    TERMIN
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {row.getValue('termin')}
            </div>
        ),
    },
    {
        accessorKey: 'status_cicilan',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    size={'sm'}
                    className="p-2 w-full text-left justify-start"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    STATUS CICILAN
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <Badge
                variant={row.original.transaction?.status_cicilan}
                className="mx-2 text-xs"
            >
                {row.original.transaction?.status_cicilan}
            </Badge>
        ),
    },

    {
        accessorKey: 'payment_type',
        header: 'TIPE BAYAR',
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    size={'sm'}
                    className="p-2 w-full text-left flex flex-row justify-between"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    NILAI
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {formatToIndonesianCurrency(row.getValue('amount'))}
            </div>
        ),
    },
    {
        accessorKey: 'waktu_bayar',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    size={'sm'}
                    className="p-2 w-full text-left flex flex-row justify-between"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    WAKTU BAYAR
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ cell }) => (
            <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {formatDate(cell.getValue() as string)}
            </div>
        ),
    },
    {
        accessorKey: 'desc',
        header: 'DESKRIPSI',
        cell: ({ row }) => (
            <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                {row.original.desc}
            </div>
        ),
    },
    {
        accessorKey: 'updatedAt',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    size={'sm'}
                    className="p-2 w-full text-left flex flex-row justify-between"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    UPDATE
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ cell }) => (
            <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {formatDate(cell.getValue() as string)}
            </div>
        ),
    },
    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];
