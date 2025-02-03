import PageContainer from '@/components/layout/page-container';
import EditItemForm from './_components/ubah-item';

export default function Page({ params }: { params: { itemId: string } }) {
    return (
        <PageContainer>
            <EditItemForm params={{ itemId: params.itemId }} />
        </PageContainer>
    );
}
