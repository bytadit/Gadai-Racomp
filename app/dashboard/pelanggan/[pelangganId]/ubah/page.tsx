import PageContainer from '@/components/layout/page-container';
import EditCustomerForm from './_components/ubah-pelanggan';

export default function Page({ params }: { params: { pelangganId: string } }) {
    return (
        <PageContainer>
            <EditCustomerForm params={{ pelangganId: params.pelangganId }} />
        </PageContainer>
    );
}
