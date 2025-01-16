import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;
        const customer = await prisma.customer.findUnique({
            where: { id: parseInt(id) },
            include: {
                customerPhones: true,
                customerDocuments: true,
            },
        });
        if (!customer) {
            return NextResponse.json(
                { error: 'Customer not found' },
                { status: 404 },
            );
        }
        return NextResponse.json(customer, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch customer' },
            { status: 500 },
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;
        const body = await req.json();
        const customer = await prisma.customer.update({
            where: { id: parseInt(id) },
            data: {
                name: body.name,
                nik: body.nik,
                address: body.address,
                desc: body.desc,
                birthdate: new Date(body.birthdate),
                gender: body.gender,
                updatedAt: new Date(),
            },
        });
        return NextResponse.json(
            { message: 'Customer updated successfully', customer },
            { status: 201 },
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to update customer' },
            { status: 500 },
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;
        if (!id) {
            return NextResponse.json(
                { error: 'Invalid customer ID' },
                { status: 400 },
            );
        }
        await prisma.customer.delete({
            where: {
                id: parseInt(id),
            },
        });
        return NextResponse.json(
            { message: 'Customer deleted successfully' },
            { status: 200 },
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete customer' },
            { status: 500 },
        );
    }
}
