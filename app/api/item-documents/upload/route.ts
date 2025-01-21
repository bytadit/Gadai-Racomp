import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export const config = {
    api: {
        bodyParser: false, // Disable the default body parser for handling FormData
    },
};
export async function POST(req: Request) {
    try {
        // Read the incoming FormData
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const fileName = formData.get('fileName') as string;

        if (!file || !fileName) {
            return NextResponse.json(
                { message: 'File or file name is missing' },
                { status: 400 },
            );
        }

        // Upload the file to Vercel Blob
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const { url } = await put(
            `uploads/item-documents/${fileName}`,
            fileBuffer,
            {
                access: 'public',
                multipart: true,
            },
        );
        return NextResponse.json(
            {
                filePath: `uploads/item-documents/${fileName}`, // File path stored in the bucket
                publicUrl: url, // Public URL to access the file
            },
            { status: 200 },
        );
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json(
            { message: 'File upload failed', error: error.message },
            { status: 500 },
        );
    }
}
