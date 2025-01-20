import { prisma } from '@/lib/prisma';
import { matchSorter } from 'match-sorter'; // For filtering

// Define the shape of User data
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
                updatedAt: 'desc', // Sort customers by `updatedAt` in descending order (most recent at the top)
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
                keys: ['name', 'nik', 'birthdate', 'address', 'desc', 'status'],
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
// export const getCustomers = async () => {
//     try {
//         const customers = await prisma.customer.findMany();
//         return customers;
//     } catch (error) {
//         throw new Error('Failed to fetch customer data');
//     }
// };
