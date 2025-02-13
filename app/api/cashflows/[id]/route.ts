import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;
        const cashflow = await prisma.cashFlow.findUnique({
            where: { id: parseInt(id) },
            include: {
                transaction: true,
            },
        });
        if (!cashflow) {
            return NextResponse.json(
                { error: 'Cashflow data not found' },
                { status: 404 },
            );
        }
        return NextResponse.json(cashflow, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cashflow' },
            { status: 500 },
        );
    }
}
export async function PUT(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const cashflowId = parseInt(params.id, 10);
        const {
            termin,
            desc,
            amount,
            waktu_bayar,
            payment_type,
        } = await req.json();

        if (
            !desc ||
            !termin ||
            !amount ||
            !waktu_bayar ||
            !payment_type
        ) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }

        // Update the document in the database
        const updatedCashflow = await prisma.cashFlow.update({
            where: { id: cashflowId },
            data: {
                termin,
                desc,
                amount,
                waktu_bayar,
                payment_type,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(
            {
                message: 'Cashflow updated successfully',
                transaction: updatedCashflow,
            },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error updating cashflow:', error);
        return NextResponse.json(
            { message: 'Failed to update cashflow', error: error.message },
            { status: 500 },
        );
    }
}
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const cashflowId = parseInt(params.id, 10);

        // Validate ID
        if (!cashflowId) {
            return NextResponse.json(
                { message: 'Invalid cashflow ID' },
                { status: 400 },
            );
        }

        // Delete the transaction from the database
        await prisma.cashFlow.delete({
            where: { id: cashflowId },
        });

        return NextResponse.json(
            { message: 'Cashflow deleted successfully' },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error deleting cashflow:', error);
        return NextResponse.json(
            { message: 'Failed to delete cashflow', error: error.message },
            { status: 500 },
        );
    }
}
