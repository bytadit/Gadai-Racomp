import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { serial, itemId } = await req.json();
        const itemIdInt = itemId ? parseInt(itemId, 10) : null;
        const whereClause = itemIdInt
            ? {
                  serial,
                  id: { not: itemIdInt },
              }
            : { serial };

        const existingItem = await prisma.item.findFirst({
            where: whereClause,
        });
        return NextResponse.json({ isUnique: !existingItem });
    } catch (error) {
        console.error('Error in checking serial uniqueness:', error);
        return NextResponse.json(
            { error: 'Failed to validate serial' },
            { status: 500 },
        );
    }
}
