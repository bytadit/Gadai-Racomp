'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { PaymentFormValues } from '../zodItemSchemas';

const PaymentStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<PaymentFormValues>();

  return (
    <div className="space-y-4 text-start">
      {/* Card Number */}
      <div className="space-y-2">
        <label htmlFor={register('cardNumber').name} className="block text-sm font-medium text-primary">
          Card Number
        </label>
        <Input id={register('cardNumber').name} {...register('cardNumber')} className="block w-full p-2 border rounded-md" />
        {errors.cardNumber && <span className="text-sm text-destructive">{errors.cardNumber.message}</span>}
      </div>

      {/* Expiration Date */}
      <div className="space-y-2">
        <label htmlFor={register('expirationDate').name} className="block text-sm font-medium text-primary">
          Expiration Date
        </label>
        <Input
          id={register('expirationDate').name}
          {...register('expirationDate')}
          className="block w-full p-2 border rounded-md"
        />
        {errors.expirationDate && <span className="text-sm text-destructive">{errors.expirationDate.message}</span>}
      </div>

      {/* CVV */}
      <div className="space-y-2">
        <label htmlFor={register('cvv').name} className="block text-sm font-medium text-primary">
          CVV
        </label>
        <Input id={register('cvv').name} {...register('cvv')} className="block w-full p-2 border rounded-md" />
        {errors.cvv && <span className="text-sm text-destructive">{errors.cvv.message}</span>}
      </div>
    </div>
  );
};

export default PaymentStep;
