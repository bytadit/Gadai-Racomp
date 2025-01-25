import PageContainer from '@/components/layout/page-container';
import { buttonVariants } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Separator } from '@/components/ui/separator';
import { searchParamsCache } from '@/lib/searchparams';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Item, Customer } from '@prisma/client';
import { getItems } from '@/lib/data';
import Link from 'next/link';
import ItemTable from './item-tables';
// type TCustomerListingPage = object;
type ItemWithCustomer = Item & {
    customer: Customer | null; // Related customer can be null if not present
};

export default async function ItemListingPage() {
    // Showcasing the use of search params cache in nested RSCs
    const page = searchParamsCache.get('page');
    const search = searchParamsCache.get('q');
    const type = searchParamsCache.get('type');
    const year = searchParamsCache.get('year');
    const brand = searchParamsCache.get('brand');

    const pageLimit = searchParamsCache.get('limit');

    const filters = {
        page,
        limit: pageLimit,
        ...(search && { search }),
        ...(year && { years: year }),
        ...(type && { types: type }),
        ...(brand && { brands: brand }),
    };

    // get data
    const data = await getItems.getPaginated(filters);
    const totalItems = data.total_items;
    const item: ItemWithCustomer[] = data.items;

    return (
        <PageContainer scrollable>
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <Heading
                        title={`Total Barang (${totalItems})`}
                        description="(Data Barang Keseluruhan)"
                    />

                    <Link
                        href={'/dashboard/barang/baru'}
                        className={cn(buttonVariants({ variant: 'default' }))}
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah
                    </Link>
                </div>
                <Separator />
                <ItemTable data={item} totalData={totalItems} />
            </div>
        </PageContainer>
    );
}
