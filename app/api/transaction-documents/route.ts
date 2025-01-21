import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { transactionId, name, doc_url, doc_type } = await req.json();

        // Validate required fields
        if (!transactionId || !name || !doc_url || !doc_type) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }
        // Create a new transactionDocument entry
        const transactionDocument = await prisma.transactionDocument.create({
            data: {
                transactionId,
                name,
                doc_type,
                doc_url,
            },
        });
        return NextResponse.json(
            { message: 'Transaction Document created successfully', transactionDocument },
            { status: 201 },
        );
    } catch (error: any) {
        console.error('Error creating transaction document:', error);
        return NextResponse.json(
            { message: 'Failed to create transaction document', error: error.message },
            { status: 500 },
        );
    }
}
