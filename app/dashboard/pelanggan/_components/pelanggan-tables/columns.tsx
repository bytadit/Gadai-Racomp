'use client';
// import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import { CellAction } from './cell-action';
import { Customer } from '@prisma/client';
import { formatDate, getAge } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        header: '#',
        cell: ({ row }) => row.index + 1,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    className="p-0"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    NAMA
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'nik',
        header: 'NIK',
    },
    {
        accessorKey: 'gender',
        header: 'GENDER',
    },
    {
        accessorKey: 'birthdate',
        header: 'USIA',
        cell: ({ row }) => getAge(row.getValue('birthdate')),
    },
    {
        accessorKey: 'address',
        header: 'ALAMAT',
    },
    {
        accessorKey: 'desc',
        header: 'DESKRIPSI',
    },
    {
        accessorKey: 'status',
        header: 'STATUS',
        cell: ({ row }) => (
            <Badge variant={row.getValue('status')}>
                {row.getValue('status')}
            </Badge>
        ),
    },
    {
        accessorKey: 'createdAt',
        header: 'tglBuat',
        cell: ({ cell }) => formatDate(cell.getValue() as string),
    },
    {
        id: 'actions',
        cell: ({ row }) => <CellAction data={row.original} />,
    },
];
