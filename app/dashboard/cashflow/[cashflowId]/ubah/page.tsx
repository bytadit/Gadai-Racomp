import PageContainer from '@/components/layout/page-container';
import EditCashflowForm from './_components/ubah-cashflow';

export default function Page({ params }: { params: { cashflowId: string } }) {
    return (
        <PageContainer>
            <EditCashflowForm params={{ cashflowId: params.cashflowId }} />
        </PageContainer>
    );
}