import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const documentId = parseInt(params.id, 10);
        const { name, doc_url, customerId, doc_type } = await req.json();

        if (!name || !doc_url) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }

        // Update the document in the database
        const updatedDocument = await prisma.customerDocument.update({
            where: { id: documentId },
            data: {
                name,
                doc_url,
                doc_type,
                customerId,
            },
        });

        return NextResponse.json(
            {
                message: 'Document updated successfully',
                document: updatedDocument,
            },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error updating document:', error);
        return NextResponse.json(
            { message: 'Failed to update document', error: error.message },
            { status: 500 },
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const documentId = parseInt(params.id, 10);

        // Validate ID
        if (!documentId) {
            return NextResponse.json(
                { message: 'Invalid document ID' },
                { status: 400 },
            );
        }

        // Delete the document from the database
        await prisma.customerDocument.delete({
            where: { id: documentId },
        });

        return NextResponse.json(
            { message: 'Document deleted successfully' },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error deleting document:', error);
        return NextResponse.json(
            { message: 'Failed to delete document', error: error.message },
            { status: 500 },
        );
    }
}
