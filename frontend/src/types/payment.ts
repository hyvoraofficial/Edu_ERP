export interface FeeStructure {
  id: string;
  academyId: string;
  name: string;
  description?: string;
  amount: number;
  frequency: 'one_time' | 'monthly' | 'term' | 'quarterly' | 'annual';
  createdAt: string;
  updatedAt: string;
}

export interface FeeAllocation {
  id: string;
  academyId: string;
  feeStructureId: string;
  studentId: string;
  dueDate: string;
  status: 'unpaid' | 'partially_paid' | 'paid' | 'void';
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  academyId: string;
  feeAllocationId: string;
  amount: number;
  currency: string;
  paymentMethod?: 'card' | 'net_banking' | 'upi' | 'wallet' | 'cash' | 'bank_transfer' | 'cheque' | 'gateway';
  gatewayProvider?: string;
  gatewayOrderId?: string;
  gatewayTransactionRef?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  failureReason?: string;
  gatewayResponse?: Record<string, any>;
  retryCount: number;
  ipAddress?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentLedgerEntry {
  id: string;
  academyId: string;
  feeAllocationId: string;
  paymentTransactionId?: string;
  amountPaid: number;
  paymentDate: string;
  receiptNumber: string;
  paymentMode: string;
  referenceNo?: string;
  remarks?: string;
  recordedBy?: string;
  createdAt: string;
  updatedAt: string;
}
