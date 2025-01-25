import * as z from 'zod';
import { defineStepper } from '@stepperize/react';
import {
    customerSchema,
    paymentSchema,
} from './zodItemSchemas';

export const { useStepper, steps, utils } = defineStepper(
    { id: 'customer', label: 'Pelanggan', schema: customerSchema },
    { id: 'payment', label: 'Bayar', schema: paymentSchema },
    { id: 'review', label: 'Review', schema: z.object({}) },
);
