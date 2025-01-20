'use client';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation'; // Correct for client-side navigation

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Edit, Info, MoreHorizontal, Trash } from 'lucide-react';
import { useState } from 'react';
import type { Customer } from '@prisma/client';
import { toast } from 'sonner';
import Link from 'next/link';

type CellActionProps = {
    data: Customer;
};

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const onConfirm = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/customers/${data.id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete customer');
            }
            toast.success('Data pelanggan berhasil dihapus!');
        } catch (error) {
            console.error('Error deleting customer:', error);
            toast.error('Data pelanggan gagal dihapus!');
        } finally {
            setOpen(false);
            setLoading(false);
            router.refresh();
        }
    };

    return (
        <>
            <AlertModal
                name={`pelanggan ${data.name}`}
                isOpen={open}
                onClose={() => setOpen(false)}
                onConfirm={onConfirm}
                loading={loading}
            />
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        aria-label="Menu"
                        variant="ghost"
                        className="flex h-8 w-8 p-0"
                    >
                        <span className="sr-only">Menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem className="p-0">
                        <Link
                            href={`/dashboard/pelanggan/${data.id}`}
                            className="flex flex-row gap-2 items-center w-full px-2 py-1.5"
                        >
                            <Info className="h-4 w-4" /> Detail
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="p-0">
                        <Link
                            href={`/dashboard/pelanggan/${data.id}/ubah`}
                            className="flex flex-row gap-2 items-center w-full px-2 py-1.5"
                        >
                            <Edit className="h-4 w-4" /> Ubah
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        <Trash className="mr-2 h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
