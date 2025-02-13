'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

export const PAYMENT_TYPE_OPTIONS = [
    { value: 'BNI', label: 'BNI' },
    { value: 'BSI', label: 'BSI' },
    { value: 'CASH', label: 'Cash'}
];

export function useCashflowTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'q',
    searchParams.q
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault('')
  );

  const [paymentTypeFilter, setPaymentTypeFilter] = useQueryState(
    'payment_type',
    searchParams.payment_type.withOptions({ shallow: false }).withDefault('')
  );

  const [page, setPage] = useQueryState(
    'page',
    searchParams.page.withDefault(1)
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setPaymentTypeFilter(null);


    setPage(1);
  }, [setSearchQuery, setPage]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!paymentTypeFilter;
  }, [searchQuery, paymentTypeFilter]);

  return {
    searchQuery,
    setSearchQuery,
    paymentTypeFilter,
    setPaymentTypeFilter,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive
  };
}
