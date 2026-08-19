import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';

export enum PlanName {
  GROWTH = 'growth',
  ENTERPRISE = 'enterprise',
  BASIC = 'basic'
}

export enum BillingCycle {
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

export class CreateSubscriptionDto {
  @ApiProperty({ example: 'growth', enum: PlanName })
  @IsEnum(PlanName)
  @IsNotEmpty()
  planName: PlanName;

  @ApiProperty({ example: 2500.00, description: 'Price of the billing period' })
  @IsNumber()
  @IsNotEmpty()
  price: number;

  @ApiProperty({ example: 'yearly', enum: BillingCycle })
  @IsEnum(BillingCycle)
  @IsNotEmpty()
  billingCycle: BillingCycle;

  @ApiProperty({ example: '2026-08-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  startsAt: string;

  @ApiProperty({ example: '2027-08-01T00:00:00Z' })
  @IsDateString()
  @IsNotEmpty()
  endsAt: string;

  @ApiProperty({ example: '2026-08-15T00:00:00Z', required: false })
  @IsDateString()
  @IsOptional()
  trialEndsAt?: string;
}
