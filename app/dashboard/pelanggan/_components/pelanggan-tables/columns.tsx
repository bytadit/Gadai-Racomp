'use client';
// import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Customer } from '@prisma/client';
import { formatDate, getAge } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
// import { Checkbox } from '@/components/ui/checkbox';

export const columns: ColumnDef<Customer>[] = [
    // {
    //     id: 'select',
    //     header: ({ table }) => (
    //         <Checkbox
    //             checked={table.getIsAllPageRowsSelected()}
    //             onCheckedChange={(value) =>
    //                 table.toggleAllPageRowsSelected(!!value)
    //             }
    //             aria-label="Select all"
    //         />
    //     ),
    //     cell: ({ row }) => (
    //         <Checkbox
    //             checked={row.getIsSelected()}
    //             onCheckedChange={(value) => row.toggleSelected(!!value)}
    //             aria-label="Select row"
    //         />
    //     ),
    //     enableSorting: false,
    //     enableHiding: false,
    // },
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
        accessorKey: 'status',
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
                    STATUS
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <Badge variant={row.getValue('status')} className="mx-2 text-xs">
                {row.getValue('status')}
            </Badge>
        ),
    },
    {
        accessorKey: 'name',
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
                    NAMA
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="whitespace-nowrap overflow-hidden text-ellipsis px-2">
                {row.original.name}
            </div>
        ),
    },
    {
        accessorKey: 'nik',
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
                    NIK
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {row.original.nik}
            </div>
        ),
    },
    {
        accessorKey: 'gender',
        header: 'GENDER',
    },
    {
        accessorKey: 'birthdate',
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
                    USIA
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="px-2 whitespace-nowrap overflow-hidden text-ellipsis">
                {getAge(row.getValue('birthdate'))}
            </div>
        ),
    },
    {
        accessorKey: 'address',
        header: 'ALAMAT',
        cell: ({ row }) => (
            <div className="whitespace-nowrap overflow-hidden text-ellipsis">
                {row.original.address}
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
        accessorKey: 'createdAt',
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
                    DIBUAT
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
