import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateFeeAllocationDto {
  @ApiProperty({ example: 'fee11111-1111-1111-1111-111111111111', description: 'Fee Structure UUID' })
  @IsUUID()
  @IsNotEmpty()
  feeStructureId: string;

  @ApiProperty({ example: 's1111111-1111-1111-1111-111111111111', description: 'Student UUID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: '2026-08-30', description: 'Payment due date YYYY-MM-DD' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ example: 1000.00, description: 'Discount applied to this allocation', required: false })
  @IsNumber()
  @IsOptional()
  discountAmount?: number;
}
