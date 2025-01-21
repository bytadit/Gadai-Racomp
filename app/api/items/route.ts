import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { name, type, desc, year, value, brand, serial, customerId } =
            await req.json();
        if (
            !name ||
            !type ||
            !desc ||
            !year ||
            !value ||
            !brand ||
            !serial ||
            !customerId
        ) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }
        const item = await prisma.item.create({
            data: {
                name,
                type,
                desc,
                year,
                value,
                brand,
                serial,
                customerId,
            },
            select: { id: true },
        });
        revalidatePath('/dashboard/items');
        return NextResponse.json(
            { message: 'Item created successfully', item },
            { status: 201 },
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to create item, please try again later' },
            { status: 500 },
        );
    }
}
