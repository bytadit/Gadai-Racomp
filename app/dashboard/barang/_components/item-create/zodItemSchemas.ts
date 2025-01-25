import * as z from 'zod';
export const customerSchema = z.object({
    name: z
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
    desc: z.string().optional(),
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
const currentYear = new Date().getFullYear();
export const itemSchema = z.object({
    name: z
        .string()
        .min(3, {
            message: 'Nama barang minimal 3 karakter!',
        })
        .nonempty({
            message: 'Masukkan nama barang!',
        }),
    gender: z.enum(['KENDARAAN', 'OTHER'], {
        required_error: 'Pilih tipe barang!',
    }),
    desc: z.string().optional(),
    year: z
        .number()
        .int({ message: 'Tahun harus berupa angka bulat!' })
        .min(1900, { message: 'Tahun tidak boleh kurang dari 1900!' })
        .max(currentYear, {
            message: `Tahun tidak boleh lebih dari ${currentYear}!`,
        })
        .refine((value) => value <= currentYear, {
            message: 'Tahun tidak boleh setelah tahun ini.',
        }),
    value: z.coerce
        .number()
        .min(0, { message: 'Nilai barang tidak boleh negatif' })
        .max(1_000_000_000_000_000, {
            message: 'Nilai tidak boleh melebih 1 trilyun!',
        }),
    address: z.string().nonempty({
        message: 'Masukkan merek barang!',
    }),
    serial: z
        .string()
        .nonempty({ message: 'Masukkan serial barang!' })
        .refine(
            async (serial) => {
                const res = await fetch('/api/items/check-serial', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ serial }),
                });
                const { isUnique } = await res.json();
                return isUnique;
            },
            { message: 'Serial barang sudah pernah terdaftar!' },
        ),
});
export const paymentSchema = z.object({
    cardNumber: z.string().min(16, 'Card number is required'),
    expirationDate: z.string().min(5, 'Expiration date is required'),
    cvv: z.string().min(3, 'CVV is required'),
});
export const shippingSchema = z.object({
    address: z.string().min(1, 'Address is required'),
    city: z.string().min(1, 'City is required'),
    postalCode: z.string().min(5, 'Postal code is required'),
});
export type CustomerFormValues = z.infer<typeof customerSchema>;
export type ItemFormValues = z.infer<typeof itemSchema>;
export type PaymentFormValues = z.infer<typeof paymentSchema>;
export type ShippingFormValues = z.infer<typeof shippingSchema>;
