import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { tableName, columnName } = await req.json();

        // Ensure both tableName and columnName are provided
        if (!tableName || !columnName) {
            return NextResponse.json(
                { message: 'Missing required tableName or columnName' },
                { status: 400 },
            );
        }

        // Query the distinct values from the specified table and column
        const result = await (prisma[tableName] as any).findMany({
            select: {
                [columnName]: true,
            },
        });

        // Extract the distinct values
        const distinctValues = result.map(
            (item: Record<string, any>) => item[columnName],
        );

        // Return the distinct values as the response
        return NextResponse.json({ distinctValues }, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch distinct values, please try again later',
            },
            { status: 500 },
        );
    }
}
