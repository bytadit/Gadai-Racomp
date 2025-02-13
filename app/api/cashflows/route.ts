import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const storedTransactionId = searchParams.get('storedTransactionId');
        const transactionId = storedTransactionId
            ? parseInt(storedTransactionId, 10)
            : null;

        const whereClause = transactionId ? { transactionId } : {};

        const cashflows = await prisma.cashFlow.findMany({
            where: whereClause,
            include: {
                transaction: true,
            },
        });

        return NextResponse.json(cashflows);
    } catch (error) {
        console.error('Error fetching cashflows:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cashflows, please try again later' },
            { status: 500 },
        );
    }
}

export async function POST(req: Request) {
    try {
        const {
            termin,
            desc = '', // default value if not provided
            amount,
            waktu_bayar,
            payment_type,
            transactionId,
        } = await req.json();

        // Validate required fields using proper checks:
        if (
            termin === undefined ||
            amount === undefined ||
            !waktu_bayar ||
            !payment_type ||
            !transactionId
        ) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }
        const cashflow = await prisma.cashFlow.create({
            data: {
                termin,
                desc, // desc is optional and defaults to empty string
                amount,
                waktu_bayar,
                payment_type,
                transactionId,
            },
            select: { id: true },
        });

        revalidatePath('/dashboard/cashflow');

        return NextResponse.json(
            { message: 'Cashflow created successfully', cashflow },
            { status: 201 },
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to create cashflow, please try again later' },
            { status: 500 },
        );
    }
}
