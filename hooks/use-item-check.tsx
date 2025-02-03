import { toast } from 'sonner';

export const useItemCheck = () => {
  const checkItem = () => {
    const currentItemId = localStorage.getItem('itemId');
    if (currentItemId === '') {
      toast.error('Pilih barang dulu!');
      return false;
    }
    return true;
  };

  return { checkItem };
};