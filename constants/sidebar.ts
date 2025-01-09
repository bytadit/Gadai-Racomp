import { NavItem } from '@/types';

export const adminMenuItems: NavItem[] = [
    // Admin Menu
    {
        title: 'RBAC',
        url: '#', // Placeholder as there is no direct link for the parent
        icon: 'rbac',
        isActive: false,
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
    {
        title: 'Konfigurasi',
        url: '/dashboard/konfigurasi',
        icon: 'settings',
        isActive: false,
        shortcut: ['k', 'k'],
        items: [], // mpty array as there are no child items for Dashboard
    },
];

export const userMenuItems: NavItem[] = [
    // Users Menu
    {
        title: 'Analitik',
        url: '/dashboard/analitik',
        icon: 'analytic',
        isActive: true,
        shortcut: ['a', 'a'],
        items: [], // mpty array as there are no child items for Dashboard
    },
    {
        title: 'Transaksi',
        url: '/dashboard/transaksi',
        icon: 'transaction',
        isActive: false,
        shortcut: ['t', 't'],
        items: [], // mpty array as there are no child items for Dashboard
    },
    {
        title: 'CashFlow',
        url: '/dashboard/cashflow',
        icon: 'cashflow',
        isActive: false,
        shortcut: ['c', 'c'],
        items: [], // mpty array as there are no child items for Dashboard
    },
    {
        title: 'Barang',
        url: '/dashboard/barang',
        icon: 'item',
        isActive: false,
        shortcut: ['b', 'b'],
        items: [], // mpty array as there are no child items for Dashboard
    },
    {
        title: 'Pelanggan',
        url: '/dashboard/pelanggan',
        icon: 'customer',
        isActive: false,
        shortcut: ['p', 'p'],
        items: [], // mpty array as there are no child items for Dashboard
    },
// batas
    {
        title: 'Dashboard',
        url: '/dashboard/overview',
        icon: 'dashboard',
        isActive: false,
        shortcut: ['d', 'd'],
        items: [], // mpty array as there are no child items for Dashboard
    },
    {
        title: 'Employee',
        url: '/dashboard/employee',
        icon: 'user',
        shortcut: ['e', 'e'],
        isActive: false,
        items: [], // No child items
    },
    {
        title: 'Product',
        url: '/dashboard/product',
        icon: 'product',
        shortcut: ['p', 'p'],
        isActive: false,
        items: [], // No child items
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
