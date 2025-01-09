import { prisma } from '@/lib/prisma';
import { matchSorter } from 'match-sorter'; // For filtering

// Define the shape of User data
export const getCustomers = {
    async getAll({
        genders = [],
        search,
    }: {
        genders?: string[];
        search?: string;
    }) {
        let customers = await prisma.customer.findMany();

        // Filter customers based on selected genders
        if (genders.length > 0) {
            customers = customers.filter((customer) =>
                genders.includes(customer.gender),
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
        search,
    }: {
        page?: number;
        limit?: number;
        genders?: string;
        search?: string;
    }) {
        const gendersArray = genders ? genders.split('.') : [];
        console.log('gendersArray', gendersArray);
        const allCustomers = await this.getAll({
            genders: gendersArray,
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
