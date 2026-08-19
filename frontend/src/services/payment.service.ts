import { 
  MOCK_FEE_STRUCTURES, 
  MOCK_FEE_ALLOCATIONS, 
  MOCK_PAYMENTS, 
  MOCK_PAYMENT_TRANSACTIONS 
} from '@/lib/mockData';
import { FeeStructure, FeeAllocation, PaymentLedgerEntry, PaymentTransaction } from '@/types/payment';

export const paymentService = {
  getFeeStructures: async (): Promise<FeeStructure[]> => {
    return Promise.resolve(MOCK_FEE_STRUCTURES);
  },
  getFeeAllocations: async (): Promise<FeeAllocation[]> => {
    return Promise.resolve(MOCK_FEE_ALLOCATIONS);
  },
  getPaymentsLedger: async (): Promise<PaymentLedgerEntry[]> => {
    return Promise.resolve(MOCK_PAYMENTS);
  },
  getTransactions: async (): Promise<PaymentTransaction[]> => {
    return Promise.resolve(MOCK_PAYMENT_TRANSACTIONS);
  },
};
