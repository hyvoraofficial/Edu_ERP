import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsNumber, IsString, IsOptional } from 'class-validator';

export class InitializeTransactionDto {
  @ApiProperty({ example: 'fa111111-1111-1111-1111-111111111111', description: 'Fee Allocation UUID' })
  @IsUUID()
  @IsNotEmpty()
  feeAllocationId: string;

  @ApiProperty({ example: 60000.00, description: 'Amount to pay in this transaction attempt' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'gateway', description: 'Payment method: card, net_banking, upi, gateway, cash, etc.' })
  @IsString()
  @IsNotEmpty()
  paymentMethod: string;

  @ApiProperty({ example: 'razorpay', description: 'Payment gateway provider (razorpay / stripe)' })
  @IsString()
  @IsNotEmpty()
  gatewayProvider: string;
}
