import PageContainer from '@/components/layout/page-container';
import CashflowForm from '../_components/cashflow-form';
import CashflowDetailPage from './_components/detail-cashflow';

export default function Page({ params }: { params: { cashflowId: string } }) {
    return (
        <PageContainer>
            {params.cashflowId === 'baru' ? (
                <CashflowForm />
            ) : (
                <CashflowDetailPage
                    params={{ cashflowId: params.cashflowId }}
                />
            )}
        </PageContainer>
    );
}
