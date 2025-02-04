import PageContainer from '@/components/layout/page-container';
import EditTransactionForm from './_components/ubah-transaksi';

export default function Page({
    params,
}: {
    params: { transactionId: string };
}) {
    return (
        <PageContainer>
            <EditTransactionForm
                params={{ transactionId: params.transactionId }}
            />
        </PageContainer>
    );
}
