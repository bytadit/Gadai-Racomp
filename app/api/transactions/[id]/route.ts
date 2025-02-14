import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;
        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(id) },
            include: {
                cashflows: true,
                transactionDocuments: true,
                item: true,
            },
        });
        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 },
            );
        }
        return NextResponse.json(transaction, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch transaction' },
            { status: 500 },
        );
    }
}
export async function PUT(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const transactionId = parseInt(params.id, 10);
        const updateData = await req.json();

        // Define allowed fields that match the schema
        const allowedFields = [
            'type',
            'nilai_pinjaman',
            'persen_tanggungan',
            'waktu_pinjam',
            'tgl_jatuh_tempo',
            'tanggungan_awal',
            'tanggungan_akhir',
            'waktu_kembali',
            'status_transaksi',
            'status_cicilan',
            'desc',
            'itemId',
        ];
        // Filter only allowed fields from the update data
        const cleanedData: Record<string, any> = {};

        for (const [key, value] of Object.entries(updateData)) {
            if (allowedFields.includes(key) && value !== undefined) {
                cleanedData[key] = value;
            }
        }

        // Add updatedAt timestamp
        cleanedData.updatedAt = new Date();

        // Update the document in the database with only allowed fields
        const updatedTransaction = await prisma.transaction.update({
            where: { id: transactionId },
            data: cleanedData,
        });

        return NextResponse.json(
            {
                message: 'Transaction updated successfully',
                transaction: updatedTransaction,
            },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error updating transaction:', error);
        return NextResponse.json(
            { message: 'Failed to update transaction', error: error.message },
            { status: 500 },
        );
    }
}
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const transactionId = parseInt(params.id, 10);

        // Validate ID
        if (!transactionId) {
            return NextResponse.json(
                { message: 'Invalid transaction ID' },
                { status: 400 },
            );
        }

        // Delete the transaction from the database
        await prisma.transaction.delete({
            where: { id: transactionId },
        });

        return NextResponse.json(
            { message: 'Transaction deleted successfully' },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error deleting transaction:', error);
        return NextResponse.json(
            { message: 'Failed to delete transaction', error: error.message },
            { status: 500 },
        );
    }
}
