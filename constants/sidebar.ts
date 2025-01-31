import { NavItem } from '@/types';

export const adminMenuItems: NavItem[] = [
    // Admin Menu
    {
        title: 'RBAC',
        url: '#', // Placeholder as there is no direct link for the parent
        icon: 'rbac',
        items: [
            {
                title: 'Roles',
                url: '/dashboard/rbac/roles',
                icon: 'role',
                shortcut: ['r', 'r'],
            },
            {
                title: 'Users',
                shortcut: ['u', 'u'],
                url: '/dashboard/rbac/users',
                icon: 'user',
            },
        ],
    },
    // {
    //     title: 'Konfigurasi',
    //     url: '/dashboard/konfigurasi',
    //     icon: 'settings',
    //     isActive: false,
    //     shortcut: ['k', 'k'],
    //     items: [],
    // },
];

export const userMenuItems: NavItem[] = [
    // Users Menu
    {
        title: 'Analitik',
        url: '/dashboard/analitik',
        icon: 'analytic',
        shortcut: ['a', 'a'],
        items: [],
    },
    {
        title: 'Transaksi',
        url: '/dashboard/transaksi',
        icon: 'transaction',
        shortcut: ['t', 't'],
        items: [],
    },
    {
        title: 'CashFlow',
        url: '/dashboard/cashflow',
        icon: 'cashflow',
        shortcut: ['c', 'c'],
        items: [],
    },
    {
        title: 'Barang',
        url: '/dashboard/barang',
        icon: 'item',
        shortcut: ['b', 'b'],
        items: [],
    },
    {
        title: 'Pelanggan',
        url: '/dashboard/pelanggan',
        icon: 'customer',
        shortcut: ['p', 'p'],
        items: [],
    },
    {
        title: 'Konfigurasi',
        url: '/dashboard/konfigurasi',
        icon: 'settings',
        shortcut: ['k', 'k'],
        items: [],
    },
    // {
    //     title: 'Account',
    //     url: '#', // Placeholder as there is no direct link for the parent
    //     icon: 'billing',
    //     isActive: true,

    //     items: [
    //         {
    //             title: 'Profile',
    //             url: '/dashboard/profile',
    //             icon: 'userPen',
    //             shortcut: ['m', 'm'],
    //         },
    //         {
    //             title: 'Login',
    //             shortcut: ['l', 'l'],
    //             url: '/',
    //             icon: 'login',
    //         },
    //     ],
    // },
    // {
    //     title: 'Kanban',
    //     url: '/dashboard/kanban',
    //     icon: 'kanban',
    //     shortcut: ['k', 'k'],
    //     isActive: false,
    //     items: [], // No child items
    // },
];
