type CalculateTanggunganAkhirParams = {
    tanggungan_awal: number;
    tgl_jatuh_tempo: Date | string;
    persen_tanggungan: number;
    nilai_pinjaman: number;
};

// type CalculateSisaTanggunganParams = {
//     transaction: {
//         id: number;
//         tanggungan_awal: number;
//         tgl_jatuh_tempo: Date | string;
//         persen_tanggungan: number;
//         nilai_pinjaman: number;
//     };
//     currentCashflowId?: number;
//     cashflows: Array<{ id: number; amount: number }>;
// };

type CalculateSisaTanggunganParams = {
    transaction: {
        id: number;
        tanggungan_awal: number;
        tgl_jatuh_tempo: Date | string;
        persen_tanggungan: number;
        nilai_pinjaman: number;
    };
    cashflows: Array<{
        transactionId: number | null;
        amount: number;
    }>;
};

type CalculateStatusTransaksiParams = {
    status_transaksi?: 'BERJALAN' | 'PERPANJANG' | 'SELESAI';
    tgl_jatuh_tempo: Date | string;
};

type CalculateStatusCicilanParams = {
    status_cicilan?: 'AMAN' | 'BERMASALAH' | 'DIJUAL';
    tgl_jatuh_tempo: Date | string;
    cashflows: Array<{
        waktu_bayar: Date | string;
    }>;
};

export const calculateTanggunganAkhir = ({
    tanggungan_awal,
    tgl_jatuh_tempo,
    persen_tanggungan,
    nilai_pinjaman,
}: CalculateTanggunganAkhirParams): number => {
    const now = new Date();
    const dueDate = new Date(tgl_jatuh_tempo);
    let tanggunganAkhir = tanggungan_awal;

    if (dueDate > now) {
        // If the due date is in the future, default is tanggungan_awal
        tanggunganAkhir = tanggungan_awal;
    } else {
        // Calculate the difference in days
        const diffTime = Math.abs(now.getTime() - dueDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays <= 10) {
            // If within 10 days, add one unit of persen_tanggungan
            tanggunganAkhir =
                Number(tanggungan_awal) + Number(persen_tanggungan);
        } else {
            // Calculate the month difference
            const yearDiff = now.getFullYear() - dueDate.getFullYear();
            const monthDiff =
                now.getMonth() - dueDate.getMonth() + yearDiff * 12;
            // Add 10% * nilai_pinjaman per month
            tanggunganAkhir =
                Number(tanggungan_awal) +
                monthDiff * 0.1 * Number(nilai_pinjaman);
        }
    }

    return tanggunganAkhir;
};

// export const calculateSisaTanggungan = async ({
//     transaction,
//     currentCashflowId,
//     cashflows,
// }: CalculateSisaTanggunganParams): Promise<number> => {
//     // Calculate current tanggungan_akhir
//     const tanggunganAkhir = calculateTanggunganAkhir({
//         tanggungan_awal: transaction.tanggungan_awal,
//         tgl_jatuh_tempo: transaction.tgl_jatuh_tempo,
//         persen_tanggungan: transaction.persen_tanggungan,
//         nilai_pinjaman: transaction.nilai_pinjaman,
//     });

//     // Filter out current cashflow if provided
//     const relevantCashflows = currentCashflowId
//         ? cashflows.filter((cf) => cf.id !== currentCashflowId)
//         : cashflows;

//     // Sum all other cashflows
//     const totalAmount = relevantCashflows.reduce(
//         (sum, cf) => sum + cf.amount,
//         0,
//     );

//     // Calculate remaining tanggungan
//     return tanggunganAkhir - totalAmount;
// };

export const calculateSisaTanggungan = ({
    transaction,
    cashflows,
}: CalculateSisaTanggunganParams): number => {
    // Calculate current tanggungan_akhir using the helper
    const tanggunganAkhir = calculateTanggunganAkhir({
        tanggungan_awal: transaction.tanggungan_awal,
        tgl_jatuh_tempo: transaction.tgl_jatuh_tempo,
        persen_tanggungan: transaction.persen_tanggungan,
        nilai_pinjaman: transaction.nilai_pinjaman,
    });

    // If cashflows is null or undefined, return tanggunganAkhir
    if (!cashflows) {
        return tanggunganAkhir;
    }

    // Filter cashflows for this transaction and sum their amounts
    const totalPaidAmount = cashflows
        .filter((cf) => cf.transactionId === transaction.id)
        .reduce((sum, cf) => sum + Number(cf.amount), 0);

    // Calculate and return remaining tanggungan
    return tanggunganAkhir - totalPaidAmount;
};

export const calculateStatusTransaksi = ({
    status_transaksi,
    tgl_jatuh_tempo,
}: CalculateStatusTransaksiParams): string => {
    // If already SELESAI, return SELESAI
    if (status_transaksi === 'SELESAI') {
        return 'SELESAI';
    }

    const now = new Date();
    const dueDate = new Date(tgl_jatuh_tempo);

    // Check if past due date
    return now > dueDate ? 'PERPANJANG' : 'BERJALAN';
};

export const calculateStatusCicilan = ({
    status_cicilan,
    tgl_jatuh_tempo,
    cashflows,
}: CalculateStatusCicilanParams): string => {
    // If already DIJUAL, return DIJUAL
    if (status_cicilan === 'DIJUAL') {
        return 'DIJUAL';
    }
    const now = new Date();
    // If no cashflows, return AMAN as default
    if (!cashflows.length) {
        const dueDate = new Date(tgl_jatuh_tempo);
        return now > dueDate ? 'BERMASALAH' : 'AMAN';
    }

    // Sort cashflows by waktu_bayar to get the latest
    const sortedCashflows = [...cashflows].sort((a, b) => {
        return (
            new Date(b.waktu_bayar).getTime() -
            new Date(a.waktu_bayar).getTime()
        );
    });

    const lastPaymentDate = new Date(sortedCashflows[0].waktu_bayar);

    // Calculate months difference
    const monthsDiff =
        (now.getFullYear() - lastPaymentDate.getFullYear()) * 12 +
        (now.getMonth() - lastPaymentDate.getMonth());

    return monthsDiff > 1 ? 'BERMASALAH' : 'AMAN';
};
