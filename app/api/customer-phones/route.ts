import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const phoneData = await req.json();

        // Ensure phoneData is an array
        if (!Array.isArray(phoneData)) {
            return NextResponse.json(
                { error: 'Invalid data format' },
                { status: 400 },
            );
        }

        // Insert multiple phone numbers linked to the customer
        await prisma.customerPhone.createMany({
            data: phoneData.map((phone) => ({
                customerId: phone.customer_id,
                phone_number: phone.phone_number,
                is_active: phone.is_active,
                is_whatsapp: phone.is_whatsapp,
            })),
        });

        return NextResponse.json(
            { message: 'Phone numbers saved successfully' },
            { status: 201 },
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Failed to save phone numbers' },
            { status: 500 },
        );
    }
}
