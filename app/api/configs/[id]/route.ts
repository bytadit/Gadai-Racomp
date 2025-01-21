import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const { id } = params;
        const config = await prisma.config.findUnique({
            where: { id: parseInt(id) },
           
        });
        if (!config) {
            return NextResponse.json(
                { error: 'Config not found' },
                { status: 404 },
            );
        }
        return NextResponse.json(config, { status: 200 });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch config' },
            { status: 500 },
        );
    }
}
export async function PUT(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const configId = parseInt(params.id, 10);
        const { key, name, value } =
            await req.json();

        if (
            !key || !name || !value
        ) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 },
            );
        }

        // Update the document in the database
        const updatedConfig = await prisma.config.update({
            where: { id: configId },
            data: {
                key, name, value
            },
        });

        return NextResponse.json(
            {
                message: 'Config updated successfully',
                config: updatedConfig,
            },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error updating config:', error);
        return NextResponse.json(
            { message: 'Failed to update config', error: error.message },
            { status: 500 },
        );
    }
}
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } },
) {
    try {
        const configId = parseInt(params.id, 10);

        // Validate ID
        if (!configId) {
            return NextResponse.json(
                { message: 'Invalid config ID' },
                { status: 400 },
            );
        }

        // Delete the config from the database
        await prisma.config.delete({
            where: { id: configId },
        });

        return NextResponse.json(
            { message: 'Config deleted successfully' },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Error deleting config:', error);
        return NextResponse.json(
            { message: 'Failed to delete config', error: error.message },
            { status: 500 },
        );
    }
}
