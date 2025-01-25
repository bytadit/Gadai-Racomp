'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { ShippingFormValues } from '../zodItemSchemas';

const ShippingStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ShippingFormValues>();

  return (
    <div className="space-y-4 text-start">
      <div className="space-y-2">
        <label htmlFor={register('address').name} className="block text-sm font-medium text-primary">
          Address
        </label>
        <Input id={register('address').name} {...register('address')} className="block w-full p-2 border rounded-md" />
        {errors.address && <span className="text-sm text-destructive">{errors.address.message}</span>}
      </div>
      <div className="space-y-2">
        <label htmlFor={register('city').name} className="block text-sm font-medium text-primary">
          City
        </label>
        <Input id={register('city').name} {...register('city')} className="block w-full p-2 border rounded-md" />
        {errors.city && <span className="text-sm text-destructive">{errors.city.message}</span>}
      </div>
      <div className="space-y-2">
        <label htmlFor={register('postalCode').name} className="block text-sm font-medium text-primary">
          Postal Code
        </label>
        <Input id={register('postalCode').name} {...register('postalCode')} className="block w-full p-2 border rounded-md" />
        {errors.postalCode && <span className="text-sm text-destructive">{errors.postalCode.message}</span>}
      </div>
    </div>
  );
};

export default ShippingStep;
