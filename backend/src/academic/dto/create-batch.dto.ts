import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsDateString, IsOptional, IsNumber } from 'class-validator';

export class CreateBatchDto {
  @ApiProperty({ example: 'b1111111-1111-1111-1111-111111111111', description: 'Branch UUID student belongs to' })
  @IsUUID()
  @IsNotEmpty()
  branchId: string;

  @ApiProperty({ example: 'c5555555-5555-5555-5555-555555555555', description: 'Course UUID Batch belongs to' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ example: 'Batch A - Morning Session', description: 'Batch name descriptor' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'JEE-26-A', description: 'Batch code identifier' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: '2026-06-01', description: 'Batch start date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2027-05-31', description: 'Batch end date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({ example: 40, description: 'Maximum students capacity limit', required: false })
  @IsNumber()
  @IsOptional()
  capacity?: number;

  @ApiProperty({ example: 'active', description: 'Batch operational status', required: false })
  @IsString()
  @IsOptional()
  status?: string;
}
