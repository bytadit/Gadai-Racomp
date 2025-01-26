import * as z from 'zod';
import { defineStepper } from '@stepperize/react';
import { customerSchema, itemSchema } from './zodItemSchemas';

export const { useStepper, steps, utils } = defineStepper(
    { id: 'customer', label: 'Pelanggan', schema: customerSchema },
    { id: 'item', label: 'Barang', schema: itemSchema },
    { id: 'review', label: 'Review', schema: z.object({}) },
    { id: 'complete', label: 'Selesai', schema: z.object({}) },
);
