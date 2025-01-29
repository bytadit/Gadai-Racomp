import { toast } from 'sonner';

export const useCustomerCheck = () => {
  const checkCustomer = () => {
    const currentCustomerId = localStorage.getItem('customerId');
    if (currentCustomerId === '') {
      toast.error('Pilih customer dulu!');
      return false;
    }
    return true;
  };

  return { checkCustomer };
};