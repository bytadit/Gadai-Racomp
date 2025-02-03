'use client';

import { searchParams } from '@/lib/searchparams';
import { useQueryState } from 'nuqs';
import { useCallback, useMemo } from 'react';

export const TYPE_OPTIONS = [
    { value: 'SIMPAN', label: 'Simpan' },
    { value: 'PAKAI', label: 'Pakai' },
];
export const STATUS_TRANSAKSI = [
    { value: 'BERJALAN', label: 'Berjalan' },
    { value: 'SELESAI', label: 'Selesai' },
    { value: 'TERLAMBAT', label: 'Terlambat' },
];
export const STATUS_CICILAN = [
    { value: 'AMAN', label: 'Aman' },
    { value: 'BERMASALAH', label: 'Bermasalah' },
    { value: 'DIJUAL', label: 'Dijual' },
];

export function useTransactionTableFilters() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'q',
    searchParams.q
      .withOptions({ shallow: false, throttleMs: 1000 })
      .withDefault('')
  );

  const [typeFilter, setTypeFilter] = useQueryState(
    'type',
    searchParams.type.withOptions({ shallow: false }).withDefault('')
  );
  const [statusCicilanFilter, setStatusCicilanFilter] = useQueryState(
    'status_cicilan',
    searchParams.status_cicilan.withOptions({ shallow: false }).withDefault('')
  );
  const [statusTransaksiFilter, setStatusTransaksiFilter] = useQueryState(
    'status_transaksi',
    searchParams.status_transaksi.withOptions({ shallow: false }).withDefault('')
  );

  const [page, setPage] = useQueryState(
    'page',
    searchParams.page.withDefault(1)
  );

  const resetFilters = useCallback(() => {
    setSearchQuery(null);
    setTypeFilter(null);
    setStatusCicilanFilter(null);
    setStatusTransaksiFilter(null);


    setPage(1);
  }, [setSearchQuery, setTypeFilter, setStatusCicilanFilter, setStatusTransaksiFilter, setPage]);

  const isAnyFilterActive = useMemo(() => {
    return !!searchQuery || !!typeFilter || !!statusCicilanFilter || !!statusTransaksiFilter;
  }, [searchQuery, typeFilter, statusCicilanFilter, statusTransaksiFilter]);

  return {
    searchQuery,
    setSearchQuery,
    typeFilter,
    statusCicilanFilter,
    statusTransaksiFilter,
    setTypeFilter,
    setStatusCicilanFilter,
    setStatusTransaksiFilter,
    page,
    setPage,
    resetFilters,
    isAnyFilterActive
  };
}
