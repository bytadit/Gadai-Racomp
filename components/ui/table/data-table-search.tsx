'use client';

import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Options } from 'nuqs';
import { useTransition } from 'react';

type DataTableSearchProps = {
    searchKey: string;
    searchQuery: string;
    setSearchQuery: (
        value: string | ((old: string) => string | null) | null,
        options?: Options<any> | undefined,
    ) => Promise<URLSearchParams>;
    setPage: <Shallow>(
        value: number | ((old: number) => number | null) | null,
        options?: Options<Shallow> | undefined,
    ) => Promise<URLSearchParams>;
};

export function DataTableSearch({
    searchKey,
    searchQuery,
    setSearchQuery,
    setPage,
}: DataTableSearchProps) {
    const [isLoading, startTransition] = useTransition();

    const handleSearch = (value: string) => {
        setSearchQuery(value, { startTransition });
        setPage(1); // Reset page to 1 when search changes
    };

    return (
        <Input
            // placeholder={`Cari ${searchKey}...`}
            placeholder={`Cari nama...`}
            value={searchQuery ?? ''}
            onChange={(e) => handleSearch(e.target.value)}
            className={cn('w-full', isLoading && 'animate-pulse')}
        />
    );
}
