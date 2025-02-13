import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { CashFlow, Transaction } from '@prisma/client';
import { getCashflows } from '@/lib/data';
import Link from 'next/link';
import CashflowTable from './cashflow-tables';
// type TCustomerListingPage = object;
type CashflowWithTransaction = CashFlow & {
    transaction: Transaction | null; // Related customer can be null if not present
};

export default async function CashflowListingPage() {
    // Showcasing the use of search params cache in nested RSCs
    const page = searchParamsCache.get('page');
    const search = searchParamsCache.get('q');
    const paymentType = searchParamsCache.get('payment_type');

    const pageLimit = searchParamsCache.get('limit');

    const filters = {
        page,
        limit: pageLimit,
        ...(search && { search }),
        ...(paymentType && { paymentTypes: paymentType }),
    };

    // get data
    const data = await getCashflows.getPaginated(filters);
    const totalCashflows = data.total_cashflows;
    const cashflow: CashflowWithTransaction[] = data.cashflows;

    return (
        <PageContainer scrollable>
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={`Total Cashflows (${totalCashflows})`}
                        description="(Data Cashflow Keseluruhan)"
                    />

                    <Link
                        href={'/dashboard/cashflow/baru'}
                        className={cn(buttonVariants({ variant: 'default' }))}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah
                    </Link>
                </div>
                <Separator />
                <CashflowTable data={cashflow} totalData={totalCashflows} />
            </div>
        </PageContainer>
    );
}
