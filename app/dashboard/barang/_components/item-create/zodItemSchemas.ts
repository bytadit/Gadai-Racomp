import * as z from 'zod';
export const customerSchema = z.object({
    customerName: z
        .string()
        .min(3, {
            message: 'Nama pelanggan minimal 3 karakter!',
        })
        .nonempty({
            message: 'Masukkan nama pelanggan!',
        }),
    phone_numbers: z
        .array(
            z.object({
                phone_number: z
                    .string()
                    .min(5, {
                        message: 'Nomor telepon minimal 5 digit!',
                    })
                    .max(15, { message: 'Nomor telepon maksimal 15 digit!' })
                    .regex(/^0[0-9]+$/, {
                        message:
                            'Nomor telepon harus dimulai dengan 0 dan hanya berisi angka',
                    })
                    .nonempty({
                        message: 'Masukkan nomor telepon pelanggan!',
                    }),
                is_active: z.boolean().optional(),
                is_whatsapp: z.boolean().optional(),
            }),
        )
        .nonempty({ message: 'Masukkan setidaknya satu nomor telepon!' }),
    nik: z
        .string()
        .nonempty({ message: 'Masukkan NIK pelanggan!' })
        .refine(
            async (nik) => {
                const res = await fetch('/api/customers/check-nik', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nik }),
                });
                const { isUnique } = await res.json();
                return isUnique;
            },
            { message: 'NIK sudah terdaftar!' },
        ),
    address: z.string().nonempty({
        message: 'Masukkan alamat pelanggan!',
    }),
    customerDesc: z.string().optional(),
    birthdate: z.date({
        required_error: 'Masukkan tanggal lahir pelanggan!',
    }),
    gender: z.enum(['PRIA', 'WANITA'], {
        required_error: 'Pilih jenis kelamin pelanggan!',
    }),
    status: z.enum(['AMAN', 'FAVORIT', 'RISIKO', 'MASALAH'], {
        required_error: 'Pilih status pelanggan!',
    }),
});
export const itemSchema = z
    .object({
        itemName: z
            .string()
            .min(3, {
                message: 'Nama barang minimal 3 karakter!',
            })
            .nonempty({
                message: 'Masukkan nama barang!',
            }),
        itemType: z.enum(['KENDARAAN', 'OTHER'], {
            required_error: 'Pilih tipe barang!',
        }),
        itemDesc: z.string().optional(),
        itemYear: z.preprocess(
            (value) => {
                if (value === '') return undefined; // Treat empty strings as undefined
                return Number(value); // Coerce other inputs to numbers
            },
            z
                .number({
                    required_error: 'Tahun tidak boleh kosong!', // Custom error for undefined
                    invalid_type_error:
                        'Tahun harus berupa angka & tidak boleh kosong!',
                })
                .int({ message: 'Tahun harus berupa angka bulat!' })
                .min(1900, { message: 'Tahun tidak boleh kurang dari 1900!' })
                .max(new Date().getFullYear(), {
                    message: `Tahun tidak boleh lebih dari ${new Date().getFullYear()}!`,
                }),
        ),
        itemValue: z.coerce
            .number()
            .min(0, { message: 'Nilai barang tidak boleh negatif' })
            .max(1_000_000_000_000_000, {
                message: 'Nilai tidak boleh melebih 1 trilyun!',
            }),
        itemBrand: z.string().nonempty({
            message: 'Masukkan merek barang!',
        }),
        itemSerial: z.string().nonempty({ message: 'Masukkan serial barang!' }),
    })
    .superRefine((data, ctx) => {
        // Validasi khusus hanya jika itemType = KENDARAAN
        if (data.itemType === 'KENDARAAN') {
            const parts = data.itemSerial.split('-');

            // Validasi jumlah bagian
            if (parts.length !== 3) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Format harus XX-0000-XXX (contoh: AB-1234-DEF)',
                    path: ['itemSerial'], // Tunjukkan error ke field itemSerial
                });
                return;
            }

            const [part1, part2, part3] = parts;

            // Validasi part1 (maks 2 huruf)
            if (part1.length > 2 || !/^[A-Za-z]+$/.test(part1)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Bagian pertama maksimal 2 huruf!',
                    path: ['itemSerial'],
                });
            }

            // Validasi part2 (maks 4 angka)
            if (part2.length > 4 || !/^\d+$/.test(part2)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Bagian kedua maksimal 4 angka!',
                    path: ['itemSerial'],
                });
            }

            // Validasi part3 (maks 3 huruf)
            if (part3.length > 3 || !/^[A-Za-z]+$/.test(part3)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: 'Bagian ketiga maksimal 3 huruf!',
                    path: ['itemSerial'],
                });
            }
        }
    })
    .refine(
        async (data) => {
            // Validasi keunikan serial (hanya jika itemType = KENDARAAN)
            if (data.itemType === 'KENDARAAN') {
                const res = await fetch('/api/items/check-serial', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serial: data.itemSerial }),
                });
                const { isUnique } = await res.json();
                return isUnique;
            }
            return true;
        },
        {
            message: 'Serial barang sudah pernah terdaftar!',
            path: ['itemSerial'], // Tunjukkan error ke field itemSerial
        },
    );

export type CustomerFormValues = z.infer<typeof customerSchema>;
export type ItemFormValues = z.infer<typeof itemSchema>;
