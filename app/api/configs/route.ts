import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const { key, name, value } = await req.json();
        if (!key || !name || !value) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }
        const config = await prisma.config.create({
            data: {
                key,
                name,
                value,
            },
            select: { id: true },
        });
        revalidatePath('/dashboard/configs');
        return NextResponse.json(
            { message: 'Config created successfully', config },
            { status: 201 },
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to create config, please try again later' },
            { status: 500 },
        );
    }
}
