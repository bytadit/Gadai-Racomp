'use client';
// import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Item, Transaction, CashFlow } from '@prisma/client';
import { cn, formatDate, formatToIndonesianCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, Link } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { getDeadlineInfo } from '@/lib/deadline';
import {
    calculateSisaTanggungan,
    calculateTanggunganAkhir,
} from '@/lib/transaction-helper';
import React from 'react';

type TransactionWithItem = Transaction & {
    item: Item | null;
};
async function fetchCashflowData(
    transactionId: number,
): Promise<{ transactionId: number; amount: number }[]> {
    try {
        // Construct the URL with the transaction id as query parameter.
        const url = `/api/cashflows?storedTransactionId=${transactionId}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch cashflow data');
        }
        // Get the cashflows from the API
        const cashflows = await response.json();
        // Map the raw data into the desired format
        return cashflows.map((cashflow: any) => ({
            transactionId: cashflow.transactionId,
            amount: Number(cashflow.amount),
        }));
    } catch (error) {
        console.error('Error in fetchCashflowData:', error);
        return [];
    }
}

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
        accessorKey: 'status_transaksi',
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
                    className="p-2 w-full text-left flex flex-row justify-between"
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
                    className="p-2 w-full text-left flex flex-row justify-between"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    DEADLINE
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ cell }) => {
            const deadlineInfo = getDeadlineInfo(cell.getValue() as string);
            return (
                <div className="px-2 flex items-center whitespace-nowrap overflow-hidden">
                    <span
                        className={`mr-2 font-bold flex-shrink-0 ${deadlineInfo.textColor}`}
                    >
                        {deadlineInfo.statusText}
                    </span>
                    <span className="overflow-hidden text-ellipsis flex-shrink">
                        {formatDate(cell.getValue() as string)}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'tanggungan_akhir',
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
                    TANGGUNGAN AKHIR
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const tanggunganAkhir = calculateTanggunganAkhir({
                tanggungan_awal: row.getValue('tanggungan_awal'),
                tgl_jatuh_tempo: row.getValue('tgl_jatuh_tempo'),
                persen_tanggungan: row.getValue('persen_tanggungan'),
                nilai_pinjaman: row.getValue('nilai_pinjaman'),
            });
            return (
                <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatToIndonesianCurrency(tanggunganAkhir)}
                </div>
            );
        },
    },
    {
        accessorKey: 'sisa_tanggungan',
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
                    SISA TANGGUNGAN
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const transactionId = row.original.id;
            const [cashflowData, setCashflowData] = React.useState<
                Array<{ transactionId: number; amount: number }>
            >([]);

            React.useEffect(() => {
                // Fetch the cashflow data for this transaction and store it in state.
                fetchCashflowData(transactionId)
                    .then((data) => {
                        setCashflowData(data);
                    })
                    .catch((error) => {
                        console.error('Error fetching cashflow data:', error);
                    });
            }, [transactionId]);

            // Now calculate sisaTanggungan using the state variable.
            const sisaTanggungan = calculateSisaTanggungan({
                transaction: {
                    id: row.original.id,
                    tanggungan_awal: row.getValue('tanggungan_awal'),
                    tgl_jatuh_tempo: row.getValue('tgl_jatuh_tempo'),
                    persen_tanggungan: row.getValue('persen_tanggungan'),
                    nilai_pinjaman: row.getValue('nilai_pinjaman'),
                },
                cashflows: cashflowData, // Using the state variable which holds the fetched cashflows.
            });
            return (
                <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                    {formatToIndonesianCurrency(sisaTanggungan)}
                </div>
            );
        },
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
                    className="p-2 w-full text-left flex flex-row justify-between"
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
                <a
                    href={`/dashboard/barang/${item?.id}`}
                    className={cn(
                        'px-1 text-left',
                        buttonVariants({ variant: 'ghost' }),
                    )}
                >
                    {item?.name || 'Unknown'}
                </a>
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
                    className="p-2 w-full text-left flex flex-row justify-between"
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
                    className="p-2 w-full text-left flex flex-row justify-between"
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
                    className="p-2 w-full text-left flex flex-row justify-between"
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
                    className="p-2 w-full text-left flex flex-row justify-between"
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
                    className="p-2 w-full text-left flex flex-row justify-between"
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
