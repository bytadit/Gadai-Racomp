import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;
        const item = await prisma.item.findUnique({
            where: { id: parseInt(id) },
            include: {
                transactions: true,
                itemDocuments: true,
            },
        });
        if (!item) {
            return NextResponse.json(
                { error: 'Item not found' },
                { status: 404 },
            );
        }
        return NextResponse.json(item, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch item' },
            { status: 500 },
        );
    }
}
export async function PUT(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const itemId = parseInt(params.id, 10);
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

        // Update the document in the database
        const updatedItem = await prisma.item.update({
            where: { id: itemId },
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
        });

        return NextResponse.json(
            {
                message: 'Item updated successfully',
                item: updatedItem,
            },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error updating item:', error);
        return NextResponse.json(
            { message: 'Failed to update item', error: error.message },
            { status: 500 },
        );
    }
}
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const itemId = parseInt(params.id, 10);

        // Validate ID
        if (!itemId) {
            return NextResponse.json(
                { message: 'Invalid item ID' },
                { status: 400 },
            );
        }

        // Delete the item from the database
        await prisma.item.delete({
            where: { id: itemId },
        });

        return NextResponse.json(
            { message: 'Item deleted successfully' },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error deleting item:', error);
        return NextResponse.json(
            { message: 'Failed to delete item', error: error.message },
            { status: 500 },
        );
    }
}
