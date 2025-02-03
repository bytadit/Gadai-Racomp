'use client';
// import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Item, Transaction } from '@prisma/client';
import { formatDate, formatToIndonesianCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

type TransactionWithItem = Transaction & {
    item: Item | null;
};

export const columns: ColumnDef<TransactionWithItem>[] = [
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
                    className="p-2 w-full text-left justify-start"
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
        accessorKey: 'status_transaksi',
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
                    TRANSAKSI
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <Badge
                variant={row.getValue('status_transaksi')}
                className="mx-2 text-xs"
            >
                {row.getValue('status_transaksi')}
            </Badge>
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
                    CICILAN
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <Badge
                variant={row.getValue('status_cicilan')}
                className="mx-2 text-xs"
            >
                {row.getValue('status_cicilan')}
            </Badge>
        ),
    },
    {
        accessorKey: 'tgl_jatuh_tempo',
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
                    DEADLINE
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
        accessorKey: 'tanggungan_akhir',
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
                    TANGGUNGAN AKHIR
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {formatToIndonesianCurrency(row.getValue('tanggungan_akhir'))}
            </div>
        ),
    },
    {
        accessorKey: 'type',
        header: 'TIPE',
    },
    // {
    //     accessorKey: 'customerName',
    //     header: ({ column }) => {
    //         return (
    //             <Button
    //                 variant="ghost"
    //                 size={'sm'}
    //                 className="p-2 w-full text-left justify-start"
    //                 onClick={() =>
    //                     column.toggleSorting(column.getIsSorted() === 'asc')
    //                 }
    //             >
    //                 PELANGGAN
    //                 <ArrowUpDown className="ml-2 h-4 w-4" />
    //             </Button>
    //         );
    //     },
    //     cell: ({ row }) => {
    //         const customer = row.original.customer;
    //         return (
    //             <div className="whitespace-nowrap overflow-hidden text-ellipsis px-2">
    //                 {customer?.name || 'Unknown'}
    //             </div>
    //         );
    //     },
    // },
    {
        accessorKey: 'itemName',
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
                    BARANG
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const item = row.original.item;
            return (
                <div className="whitespace-nowrap overflow-hidden text-ellipsis px-2">
                    {item?.name || 'Unknown'}
                </div>
            );
        },
    },
    {
        accessorKey: 'nilai_pinjaman',
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
                    NILAI PINJAMAN
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {formatToIndonesianCurrency(row.getValue('nilai_pinjaman'))}
            </div>
        ),
    },
    {
        accessorKey: 'persen_tanggungan',
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
                    PERSEN TANGGUNGAN
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {formatToIndonesianCurrency(row.getValue('persen_tanggungan'))}
            </div>
        ),
    },
    {
        accessorKey: 'tanggungan_awal',
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
                    TANGGUNGAN AWAL
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {formatToIndonesianCurrency(row.getValue('tanggungan_awal'))}
            </div>
        ),
    },
    {
        accessorKey: 'waktu_pinjam',
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
                    WAKTU PINJAM
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
        accessorKey: 'waktu_kembali',
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
                    WAKTU KEMBALI
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
        accessorKey: 'updatedAt',
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
