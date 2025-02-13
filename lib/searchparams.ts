import {
  createSearchParamsCache,
  createSerializer,
  parseAsInteger,
  parseAsString
} from 'nuqs/server';

export const searchParams = {
  page: parseAsInteger.withDefault(1),
  limit: parseAsInteger.withDefault(10),
  q: parseAsString,
  gender: parseAsString,
  brand: parseAsString,
  status: parseAsString,
  status_cicilan: parseAsString,
  status_transaksi: parseAsString,
  item_status: parseAsString,
  payment_type: parseAsString,
  year: parseAsString,
  type: parseAsString,
  categories: parseAsString
};

export const searchParamsCache = createSearchParamsCache(searchParams);
export const serialize = createSerializer(searchParams);
