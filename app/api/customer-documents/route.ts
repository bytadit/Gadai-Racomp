import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        // Parse the incoming JSON request body
        const { customer_id, file_name, doc_url } = await req.json();

        // Validate required fields
        if (!customer_id || !file_name || !doc_url) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }

        // Create a new CustomerDocument entry
        const document = await prisma.customerDocument.create({
            data: {
                customerId: customer_id,
                name: file_name,
                doc_type: 'FOTO', // Hardcoded as required
                doc_url,
            },
        });

        return NextResponse.json(
            { message: 'Document created successfully', document },
            { status: 201 },
        );
    } catch (error: any) {
        console.error('Error creating document:', error);
        return NextResponse.json(
            { message: 'Failed to create document', error: error.message },
            { status: 500 },
        );
    }
}
