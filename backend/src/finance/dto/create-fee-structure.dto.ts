import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsOptional } from 'class-validator';

export enum FeeFrequency {
  ONE_TIME = 'one_time',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  SEMI_ANNUAL = 'semi_annual',
  TERM = 'term',
  ANNUAL = 'annual',
  YEARLY = 'yearly'
}

export class CreateFeeStructureDto {
  @ApiProperty({ example: 'Tuition Fee - Grade 10', description: 'Name of the fee structure item' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Yearly tuition charge mapped to Grade 10 secondary education', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 120000.00, description: 'Syllabus price amount' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ example: 'yearly', enum: FeeFrequency })
  @IsEnum(FeeFrequency)
  @IsNotEmpty()
  frequency: FeeFrequency;
}
