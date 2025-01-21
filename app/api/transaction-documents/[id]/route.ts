import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const transactionDocumentId = parseInt(params.id, 10);
        const { name, doc_url, transactionId, doc_type } = await req.json();

        if (!name || !doc_url || !transactionId || !doc_type) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }

        // Update the document in the database
        const updatedTransactionDocument = await prisma.transactionDocument.update({
            where: { id: transactionDocumentId },
            data: {
                name,
                doc_url,
                doc_type,
                transactionId
            },
        });

        return NextResponse.json(
            { message: 'Transaction Document updated successfully', transactionDocument: updatedTransactionDocument },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error updating transaction document:', error);
        return NextResponse.json(
            { message: 'Failed to update document', error: error.message },
            { status: 500 },
        );
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const transactionDocumentId = parseInt(params.id, 10);

        // Validate ID
        if (!transactionDocumentId) {
            return NextResponse.json(
                { message: 'Invalid transaction document ID' },
                { status: 400 },
            );
        }

        // Delete the document from the database
        await prisma.transactionDocument.delete({
            where: { id: transactionDocumentId },
        });

        return NextResponse.json(
            { message: 'Transaction Document deleted successfully' },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error deleting transaction document:', error);
        return NextResponse.json(
            { message: 'Failed to delete transaction document', error: error.message },
            { status: 500 },
        );
    }
}