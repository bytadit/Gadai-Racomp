import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { nik, customerId } = await req.json();
        const customerIdInt = customerId ? parseInt(customerId, 10) : null;
        const whereClause = customerIdInt
            ? {
                  nik,
                  id: { not: customerIdInt },
              }
            : { nik };

        const existingCustomer = await prisma.customer.findFirst({
            where: whereClause,
        });
        return NextResponse.json({ isUnique: !existingCustomer });
    } catch (error) {
        console.error('Error in checking NIK uniqueness:', error);
        return NextResponse.json(
            { error: 'Failed to validate NIK' },
            { status: 500 },
        );
    }
}
