import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const {
            desc,
            type,
            nilai_pinjaman,
            persen_tanggungan,
            waktu_pinjam,
            tgl_jatuh_tempo,
            tanggungan_awal,
            tanggungan_akhir,
            waktu_kembali,
            status_transaksi,
            status_cicilan,
            itemId,
        } = await req.json();
        if (
            !desc ||
            !type ||
            !nilai_pinjaman ||
            !persen_tanggungan ||
            !waktu_pinjam ||
            !tgl_jatuh_tempo ||
            !tanggungan_awal ||
            !tanggungan_akhir ||
            !waktu_kembali ||
            !status_transaksi ||
            !status_cicilan ||
            !itemId
        ) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }
        const transaction = await prisma.transaction.create({
            data: {
                desc,
                type,
                nilai_pinjaman,
                persen_tanggungan,
                waktu_pinjam,
                tgl_jatuh_tempo,
                tanggungan_awal,
                tanggungan_akhir,
                waktu_kembali,
                status_transaksi,
                status_cicilan,
                itemId,
            },
            select: { id: true },
        });
        revalidatePath('/dashboard/transactions');
        return NextResponse.json(
            { message: 'Transaction created successfully', transaction },
            { status: 201 },
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to create transaction, please try again later' },
            { status: 500 },
        );
    }
}
