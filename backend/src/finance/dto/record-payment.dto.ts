import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsNumber, IsString, IsOptional } from 'class-validator';

export class RecordPaymentDto {
  @ApiProperty({ example: 'fa111111-1111-1111-1111-111111111111', description: 'Fee Allocation UUID' })
  @IsUUID()
  @IsNotEmpty()
  feeAllocationId: string;

  @ApiProperty({ example: 60000.00, description: 'Amount paid in cash or offline transfer' })
  @IsNumber()
  @IsNotEmpty()
  amountPaid: number;

  @ApiProperty({ example: 'cash', description: 'Payment mode: cash, cheque, bank_transfer' })
  @IsString()
  @IsNotEmpty()
  paymentMode: string;

  @ApiProperty({ example: 'CHQ-4567-MATH', description: 'Cheque or bank transfer reference number', required: false })
  @IsString()
  @IsOptional()
  referenceNo?: string;

  @ApiProperty({ example: 'Received Tuition Term-1 installment fees in cash', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;
}
