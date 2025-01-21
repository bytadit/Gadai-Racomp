import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { itemId, name, doc_url } = await req.json();

        // Validate required fields
        if (!itemId || !name || !doc_url) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }
        // Create a new ItemDocument entry
        const itemDocument = await prisma.itemDocument.create({
            data: {
                itemId,
                name,
                doc_type: 'FOTO',
                doc_url,
            },
        });
        return NextResponse.json(
            { message: 'Item Document created successfully', itemDocument },
            { status: 201 },
        );
    } catch (error: any) {
        console.error('Error creating item document:', error);
        return NextResponse.json(
            { message: 'Failed to create item document', error: error.message },
            { status: 500 },
        );
    }
}
