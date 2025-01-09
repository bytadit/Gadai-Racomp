import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
// import { Employee } from '@/constants/data';
import { Customer } from '@prisma/client';
// get data
// import { fakeUsers } from '@/constants/mock-api';
import { getCustomers } from '@/lib/data';
import Link from 'next/link';
import CustomerTable from './pelanggan-tables';

type TCustomerListingPage = {};

export default async function CustomerListingPage({}: TCustomerListingPage) {
    // Showcasing the use of search params cache in nested RSCs
    const page = searchParamsCache.get('page');
    const search = searchParamsCache.get('q');
    const gender = searchParamsCache.get('gender');
    const pageLimit = searchParamsCache.get('limit');

    const filters = {
        page,
        limit: pageLimit,
        ...(search && { search }),
        ...(gender && { genders: gender }),
    };

    // get data
    const data = await getCustomers.getPaginated(filters);
    const totalCustomers = data.total_customers;
    const customer: Customer[] = data.customers;

    return (
        <PageContainer scrollable>
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={`Customer (${totalCustomers})`}
                        description="(Data Pelanggan Keseluruhan)"
                    />

                    <Link
                        href={'/dashboard/pelanggan/new'}
                        className={cn(buttonVariants({ variant: 'default' }))}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah
                    </Link>
                </div>
                <Separator />
                <CustomerTable data={customer} totalData={totalCustomers} />
            </div>
        </PageContainer>
    );
}
