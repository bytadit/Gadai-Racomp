// In your api/customers.ts file

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const query = url.searchParams.get('query') || '';

        const customers = await prisma.customer.findMany({
            where: {
                name: {
                    contains: query, // Match the name that contains the query string (case-insensitive)
                    mode: 'insensitive',
                },
            },
            select: {
                id: true,
                name: true,
                nik: true,
                address: true,
                status: true,
            },
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to search customers, please try again later' },
            { status: 500 },
        );
    }
}
