import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const itemDocumentId = parseInt(params.id, 10);
        const { name, doc_url, itemId, doc_type } = await req.json();

        if (!name || !doc_url || !itemId || !doc_type) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }

        // Update the document in the database
        const updatedItemDocument = await prisma.itemDocument.update({
            where: { id: itemDocumentId },
            data: {
                name,
                doc_url,
                doc_type,
                itemId
            },
        });

        return NextResponse.json(
            { message: 'Item Document updated successfully', itemDocument: updatedItemDocument },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error updating item document:', error);
        return NextResponse.json(
            { message: 'Failed to update document', error: error.message },
            { status: 500 },
        );
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const itemDocumentId = parseInt(params.id, 10);

        // Validate ID
        if (!itemDocumentId) {
            return NextResponse.json(
                { message: 'Invalid item document ID' },
                { status: 400 },
            );
        }

        // Delete the document from the database
        await prisma.itemDocument.delete({
            where: { id: itemDocumentId },
        });

        return NextResponse.json(
            { message: 'Item Document deleted successfully' },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error deleting item document:', error);
        return NextResponse.json(
            { message: 'Failed to delete item document', error: error.message },
            { status: 500 },
        );
    }
}