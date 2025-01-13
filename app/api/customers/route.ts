import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const data = await req.json();
        const customer = await prisma.customer.create({
            data: {
                name: data.name,
                nik: data.nik,
                address: data.address,
                desc: data.desc,
                birthdate: new Date(data.birthdate),
                gender: data.gender,
                status: data.status,
            },
            select: { id: true },
        });
        revalidatePath('/dashboard/pelanggan');
        return NextResponse.json(
            { message: 'Customer created successfully', customer },
            { status: 201 },
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to create customer, please try again later' },
            { status: 500 },
        );
    }
}
