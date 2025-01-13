'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

type CustomerData = {
    name: string;
    nik: string;
    address: string;
    desc?: string;
    birthdate: Date;
    gender: 'PRIA' | 'WANITA';
};

export async function createCustomer(data: CustomerData) {
    console.log(data);
    try {
        await prisma.customer.create({
            data: {
                name: data.name,
                nik: data.nik,
                address: data.address,
                desc: data.desc,
                birthdate: data.birthdate,
                gender: data.gender,
            },
        });

        revalidatePath('/dashboard/pelanggan');
        redirect('/dashboard/pelanggan');
    } catch (error: any) {
        console.error('Prisma Error:', error); // ✅ Log the actual error
        throw new Error(error.message || 'Failed to create customer');
    }
}
