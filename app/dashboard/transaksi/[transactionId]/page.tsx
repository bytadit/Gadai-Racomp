import PageContainer from '@/components/layout/page-container';
import TransactionCreate from '../_components/transaction-create/transaction-create';
// import TransactionDetailPage from ;
// import CustomerDetailPage from '../../pelanggan/[pelangganId]/_components/detail-pelanggan';

export default function Page({
    params,
}: {
    params: { transactionId: string };
}) {
    return (
        <PageContainer>
            {params.transactionId === 'baru' ? (
                <TransactionCreate />
            ) : (
                <TransactionCreate />
            )}
        </PageContainer>
    );
}
