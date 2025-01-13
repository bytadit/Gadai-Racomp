import PageContainer from '@/components/layout/page-container';
import CustomerForm from '../_components/pelanggan-form';
import CustomerDetailPage from './_components/detail-pelanggan';

export default function Page({ params }: { params: { pelangganId: string } }) {
    return (
        <PageContainer>
            {params.pelangganId === 'baru' ? (
                <CustomerForm />
            ) : (
                <CustomerDetailPage
                    params={{ pelangganId: params.pelangganId }}
                />
            )}
        </PageContainer>
    );
}
