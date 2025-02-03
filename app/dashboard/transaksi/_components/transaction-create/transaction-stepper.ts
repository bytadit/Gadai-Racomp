import * as z from 'zod';
import { defineStepper } from '@stepperize/react';
import { customerSchema, transactionSchema, itemSchema } from '../../../../../lib/zod-schemas';

export const { useStepper, steps, utils } = defineStepper(
    { id: 'customer', label: 'Pelanggan', schema: customerSchema },
    { id: 'item', label: 'Barang', schema: itemSchema },
    { id: 'transaction', label: 'Transaksi', schema: transactionSchema },
    { id: 'review', label: 'Review', schema: z.object({}) },
    { id: 'complete', label: 'Selesai', schema: z.object({}) },
);
