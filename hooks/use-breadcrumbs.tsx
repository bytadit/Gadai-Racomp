'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

type BreadcrumbItem = {
    title: string;
    link: string;
};

// This allows to add custom title as well
const routeMapping: Record<string, BreadcrumbItem[]> = {
    '/dashboard': [{ title: 'Dashboard', link: '/dashboard' }],
    '/dashboard/pelanggan': [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Pelanggan', link: '/dashboard/pelanggan' },
    ],
    '/dashboard/pelanggan/baru': [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Pelanggan', link: '/dashboard/pelanggan' },
        { title: 'Pelanggan Baru', link: '/dashboard/pelanggan/baru' },
    ],
    '/dashboard/barang': [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Barang', link: '/dashboard/barang' },
    ],
    '/dashboard/barang/baru': [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Barang', link: '/dashboard/barang' },
        { title: 'Barang Masuk', link: '/dashboard/barang/baru' },
    ],
    '/dashboard/transaksi': [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Transaksi', link: '/dashboard/transaksi' },
    ],
    'dashboard/transaksi/baru': [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'Transaksi', link: '/dashboard/transaksi' },
        { title: 'Transaksi Baru', link: '/dashboard/barang/baru' },
    ],
    '/dashboard/cashflow': [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'CashFlow', link: '/dashboard/cashflow' },
    ],
    'dashboard/cashflow/baru': [
        { title: 'Dashboard', link: '/dashboard' },
        { title: 'CashFlow', link: '/dashboard/cashflow' },
        { title: 'Tambah CashFlow', link: '/dashboard/cashflow/baru' },
    ],
    // Add more custom mappings as needed
};

export function useBreadcrumbs() {
    const pathname = usePathname();

    const breadcrumbs = useMemo(() => {
        // Check if we have a custom mapping for this exact path
        if (routeMapping[pathname]) {
            return routeMapping[pathname];
        }

        // If no exact match, fall back to generating breadcrumbs from the path
        const segments = pathname.split('/').filter(Boolean);
        return segments.map((segment, index) => {
            const path = `/${segments.slice(0, index + 1).join('/')}`;
            return {
                title: segment.charAt(0).toUpperCase() + segment.slice(1),
                link: path,
            };
        });
    }, [pathname]);

    return breadcrumbs;
}
