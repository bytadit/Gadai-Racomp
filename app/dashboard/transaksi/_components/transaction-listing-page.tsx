import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Transaction, Item} from '@prisma/client';
import { getTransactions } from '@/lib/data';
import Link from 'next/link';
import TransactionTable from './transaction-tables';
// type TCustomerListingPage = object;

type TransactionWithItem = Transaction & {
    item: Item | null;
};

export default async function TransactionListingPage() {
    // Showcasing the use of search params cache in nested RSCs
    const page = searchParamsCache.get('page');
    const search = searchParamsCache.get('q');
    const type = searchParamsCache.get('type');
    const statusCicilan = searchParamsCache.get('status_cicilan');
    const statusTransaksi = searchParamsCache.get('status_transaksi');
    const pageLimit = searchParamsCache.get('limit');

    const filters = {
        page,
        limit: pageLimit,
        ...(search && { search }),
        ...(type && { types: type }),
        ...(statusCicilan && { cicilanStatus: statusCicilan }),
        ...(statusTransaksi && { transactionStatus: statusTransaksi }),
    };

    // get data
    const data = await getTransactions.getPaginated(filters);
    const totalTransactions = data.total_transactions;
    const transaction: TransactionWithItem[] = data.transactions;

    return (
        <PageContainer scrollable>
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={`Total Transaksi (${totalTransactions})`}
                        description="(Data Transaksi Keseluruhan)"
                    />

                    <Link
                        href={'/dashboard/transaksi/baru'}
                        className={cn(buttonVariants({ variant: 'default' }))}
                    >
                        <Plus className="h-4 w-4" />
                    </Link>
                </div>
                <Separator />
                <TransactionTable
                    data={transaction}
                    totalData={totalTransactions}
                />
            </div>
        </PageContainer>
    );
}
