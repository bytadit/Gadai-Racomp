import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const storedItemId = searchParams.get('storedItemId');
        const status = searchParams.get('status');
        // const itemId = storedItemId ? parseInt(storedItemId, 10) : null;

        // const whereClause = itemId ? { itemId } : {};

        const transactions = await prisma.transaction.findMany({
            where: {
                itemId: storedItemId ? parseInt(storedItemId, 10) : undefined,
                status_transaksi:
                    status === 'active' ? { not: 'SELESAI' } : undefined,
            },
            include: {
                item: true,
                cashflows: true,
                transactionDocuments: true,
            },
        });
        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transactions, please try again later' },
            { status: 500 },
        );
    }
}

export async function POST(req: Request) {
    try {
        // Parse the request body as JSON.
        const data = await req.json();

        // Define an array of required field names.
        const requiredFields = [
            'desc',
            'type',
            'nilai_pinjaman',
            'persen_tanggungan',
            'waktu_pinjam',
            'tgl_jatuh_tempo',
            'tanggungan_awal',
            'tanggungan_akhir',
            'status_transaksi',
            'status_cicilan',
            'itemId',
        ];

        // Check for missing fields.
        // Here we consider a field missing if its value is undefined or null.
        const missingFields = requiredFields.filter(
            (field) => data[field] === undefined || data[field] === null,
        );

        // If there are any missing fields, return a detailed error message.
        if (missingFields.length > 0) {
            return NextResponse.json(
                {
                    message: `Missing required fields: ${missingFields.join(', ')}`,
                },
                { status: 400 },
            );
        }

        // Create the transaction with the validated data.
        const transaction = await prisma.transaction.create({
            data: {
                desc: data.desc,
                type: data.type,
                nilai_pinjaman: data.nilai_pinjaman,
                persen_tanggungan: data.persen_tanggungan,
                waktu_pinjam: data.waktu_pinjam,
                tgl_jatuh_tempo: data.tgl_jatuh_tempo,
                tanggungan_awal: data.tanggungan_awal,
                tanggungan_akhir: data.tanggungan_akhir,
                waktu_kembali: data.waktu_kembali,
                status_transaksi: data.status_transaksi,
                status_cicilan: data.status_cicilan,
                itemId: data.itemId,
            },
            select: { id: true },
        });

        // Optionally, revalidate the page cache.
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
