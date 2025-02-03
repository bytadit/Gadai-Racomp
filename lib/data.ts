import { prisma } from '@/lib/prisma';
import { matchSorter } from 'match-sorter';

export const getCustomers = {
    async getAll({
        genders = [],
        statuses = [],
        search,
    }: {
        genders?: string[];
        statuses?: string[];
        search?: string;
    }) {
        let customers = await prisma.customer.findMany({
            orderBy: {
                updatedAt: 'desc',
            },
        });
        // Filter customers based on selected genders
        if (genders.length > 0) {
            customers = customers.filter((customer) =>
                genders.includes(customer.gender),
            );
        }
        // Filter customers based on selected statuses
        if (statuses.length > 0) {
            customers = customers.filter((customer) =>
                statuses.includes(customer.status),
            );
        }
        // Search functionality across multiple fields
        if (search) {
            customers = matchSorter(customers, search, {
                keys: ['name'], //add what columns you want to search
            });
        }
        return customers;
    },
    // Get paginated results with optional gender filtering and search
    async getPaginated({
        page = 1,
        limit = 10,
        genders,
        statuses,
        search,
    }: {
        page?: number;
        limit?: number;
        genders?: string;
        statuses?: string;
        search?: string;
    }) {
        const gendersArray = genders ? genders.split('.') : [];
        const statusesArray = statuses ? statuses.split('.') : [];
        const allCustomers = await this.getAll({
            genders: gendersArray,
            statuses: statusesArray,
            search,
        });
        const totalCustomers = allCustomers.length;
        // Pagination logic
        const offset = (page - 1) * limit;
        const paginatedCustomers = allCustomers.slice(offset, offset + limit);
        // Mock current time
        const currentTime = new Date().toISOString();
        // Return paginated response
        return {
            success: true,
            time: currentTime,
            message: 'Customers Data',
            total_customers: totalCustomers,
            offset,
            limit,
            customers: paginatedCustomers,
        };
    },
};

export const getItems = {
    // filter by
    // - type V
    // - brand V
    // - year V
    // - value range
    async getAll({
        types = [],
        brands = [],
        years = [],
        search,
    }: {
        types?: string[];
        brands?: string[];
        years?: string[];
        search?: string;
    }) {
        let items = await prisma.item.findMany({
            include: {
                customer: true, // Include the related customer data
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        // Filter items based on selected types
        if (types.length > 0) {
            items = items.filter((item) => types.includes(item.type));
        }
        if (years.length > 0) {
            items = items.filter((item) =>
                years.includes(item.year ? item.year.toString() : ''),
            );
        }
        if (brands.length > 0) {
            items = items.filter((item) => brands.includes(item.brand));
        }
        // Search functionality across multiple fields
        if (search) {
            items = matchSorter(items, search, {
                keys: ['name', 'desc', 'brand', 'serial', 'customer'],
            });
        }
        return items;
    },
    // Get paginated results with optional gender filtering and search
    async getPaginated({
        page = 1,
        limit = 10,
        types,
        brands,
        years,
        search,
    }: {
        page?: number;
        limit?: number;
        types?: string;
        years?: string;
        brands?: string;
        search?: string;
    }) {
        const typesArray = types ? types.split('.') : [];
        const brandsArray = brands ? brands.split('.') : [];
        const yearsArray = years ? years.split('.') : [];

        const allItems = await this.getAll({
            types: typesArray,
            brands: brandsArray,
            years: yearsArray,
            search,
        });
        const totalItems = allItems.length;
        // Pagination logic
        const offset = (page - 1) * limit;
        const paginatedItems = allItems.slice(offset, offset + limit);
        // Mock current time
        const currentTime = new Date().toISOString();
        // Return paginated response
        return {
            success: true,
            time: currentTime,
            message: 'Items Data',
            total_items: totalItems,
            offset,
            limit,
            items: paginatedItems,
        };
    },
};

export const getTransactions = {
    // filter by
    // - nilai pinjaman range
    // - waktu pinjam range
    // - jatuh tempo range
    // - tanggungan akhir range

    // - type
    // - status transaksi
    // - status cicilan
    async getAll({
        types = [],
        cicilanStatus = [],
        transactionStatus = [],
        search,
    }: {
        types?: string[];
        cicilanStatus?: string[];
        transactionStatus?: string[];
        search?: string;
    }) {
        let transactions = await prisma.transaction.findMany({
            include: {
                item: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
        // Filter items based on selected types
        if (cicilanStatus.length > 0) {
            transactions = transactions.filter((transaction) =>
                cicilanStatus.includes(transaction.status_cicilan),
            );
        } else if (transactionStatus.length > 0) {
            transactions = transactions.filter((transaction) =>
                transactionStatus.includes(transaction.status_transaksi),
            );
        } else if (types.length > 0) {
            transactions = transactions.filter((transaction) =>
                types.includes(transaction.type),
            );
        } else if (search) {
            transactions = matchSorter(transactions, search, {
                keys: ['customer', 'item'],
            });
        }
        return transactions;
    },
    // Get paginated results with optional gender filtering and search
    async getPaginated({
        page = 1,
        limit = 10,
        types,
        cicilanStatus,
        transactionStatus,
        search,
    }: {
        page?: number;
        limit?: number;
        types?: string;
        cicilanStatus?: string;
        transactionStatus?: string;
        search?: string;
    }) {
        const typesArray = types ? types.split('.') : [];
        const cicilanStatusArray = cicilanStatus
            ? cicilanStatus.split('.')
            : [];
        const transactionStatusArray = transactionStatus
            ? transactionStatus.split('.')
            : [];
        const allTransactions = await this.getAll({
            types: typesArray,
            cicilanStatus: cicilanStatusArray,
            transactionStatus: transactionStatusArray,
            search,
        });
        const totalTransactions = allTransactions.length;
        // Pagination logic
        const offset = (page - 1) * limit;
        const paginatedTransactions = allTransactions.slice(
            offset,
            offset + limit,
        );
        // Mock current time
        const currentTime = new Date().toISOString();
        // Return paginated response
        return {
            success: true,
            time: currentTime,
            message: 'Transactions Data',
            total_transactions: totalTransactions,
            offset,
            limit,
            transactions: paginatedTransactions,
        };
    },
};

export const getConfigs = {
    // filter by
    // - key
    // - name

    async getAll({ search }: { search?: string }) {
        let configs = await prisma.config.findMany({
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Search functionality across multiple fields
        if (search) {
            configs = matchSorter(configs, search, {
                keys: ['key', 'name'],
            });
        }
        return configs;
    },
    // Get paginated results with optional gender filtering and search
    async getPaginated({
        page = 1,
        limit = 10,
        search,
    }: {
        page?: number;
        limit?: number;
        search?: string;
    }) {
        const allConfigs = await this.getAll({
            search,
        });
        const totalConfigs = allConfigs.length;
        // Pagination logic
        const offset = (page - 1) * limit;
        const paginatedConfigs = allConfigs.slice(offset, offset + limit);
        // Mock current time
        const currentTime = new Date().toISOString();
        // Return paginated response
        return {
            success: true,
            time: currentTime,
            message: 'Configs Data',
            total_configs: totalConfigs,
            offset,
            limit,
            configs: paginatedConfigs,
        };
    },
};
