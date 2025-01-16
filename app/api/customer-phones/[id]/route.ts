import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;
        const body = await req.json();

        // const { phoneId, phone_number, is_active } = await req.json();

        // Check if phoneId exists
        const existingPhone = await prisma.customerPhone.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingPhone) {
            return NextResponse.json(
                { error: 'Phone number not found' },
                { status: 404 },
            );
        }

        // Update the phone number
        // await prisma.customerPhone.update({
        //     where: { id: phoneId },
        //     data: {
        //         phone_number,
        //         is_active,
        //     },
        // });

        await prisma.customerPhone.update({
            where: { id: parseInt(id) },
            data: {
                phone_number: body.phone_number,
                is_active: body.is_active,
                is_whatsapp: true,
                updatedAt: new Date(),
            },
        });

        return NextResponse.json(
            { message: 'Phone number updated successfully' },
            { status: 200 },
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to update phone number' },
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
                { error: 'Invalid customer phone ID' },
                { status: 400 },
            );
        }
        // Check if phone number exists
        const existingPhone = await prisma.customerPhone.findUnique({
            where: { id: parseInt(id) },
        });

        if (!existingPhone) {
            return NextResponse.json(
                { error: 'Phone number not found' },
                { status: 404 },
            );
        }

        // Delete phone number from the database
        await prisma.customerPhone.delete({
            where: {
                id: parseInt(id),
            },
        });

        return NextResponse.json(
            { message: 'Phone number deleted successfully' },
            { status: 200 },
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to delete phone number' },
            { status: 500 },
        );
    }
}
