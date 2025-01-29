// app/api/utils/get-distinct-values/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { tableName, columnName, filters } = await req.json();

        if (!tableName || !columnName) {
            return NextResponse.json(
                { message: 'Missing required parameters' },
                { status: 400 }
            );
        }

        // Build where clause based on filters
        const whereClause: any = {};
        if (filters) {
            if (filters.type) {
                whereClause.type = filters.type;
            }
            if (filters.year) {
                whereClause.year = parseInt(filters.year);
            }
        }

        const result = await (prisma[tableName] as any).groupBy({
            by: [columnName],
            where: whereClause,
            _count: {
                _all: true,
            },
            orderBy: {
                [columnName]: 'desc'
            }
        });

        const processed = result.map((entry: any) => ({
            value: entry[columnName] ?? null,
            count: entry._count._all,
        }));

        return NextResponse.json({ data: processed }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data' },
            { status: 500 }
        );
    }
}