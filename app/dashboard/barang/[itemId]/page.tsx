import PageContainer from '@/components/layout/page-container';
import ItemCreate from '../_components/item-create/item-create';
// import CustomerDetailPage from '../../pelanggan/[pelangganId]/_components/detail-pelanggan';

export default function Page({ params }: { params: { itemId: string } }) {
    return (
        <PageContainer>
            {params.itemId === 'baru' ? <ItemCreate /> : ''}
        </PageContainer>
    );
}
