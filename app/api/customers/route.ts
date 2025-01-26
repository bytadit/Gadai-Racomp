import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                customerPhones: true,
                items: true,
            },
        });

        return NextResponse.json(customers);
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customers, please try again later' },
            { status: 500 },
        );
    }
}

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
