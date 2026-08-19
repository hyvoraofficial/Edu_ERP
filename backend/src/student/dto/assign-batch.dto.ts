import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';

export enum EnrollmentStatus {
  ENROLLED = 'enrolled',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  COMPLETED = 'completed',
  WITHDRAWN = 'withdrawn'
}

export class AssignBatchDto {
  @ApiProperty({ example: 'b1111111-1111-1111-1111-111111111111', description: 'Batch UUID' })
  @IsString()
  @IsNotEmpty()
  batchId: string;

  @ApiProperty({ example: 'Roll-54', description: 'Roll number of student in this batch', required: false })
  @IsString()
  @IsOptional()
  rollNumber?: string;

  @ApiProperty({ example: 'enrolled', enum: EnrollmentStatus, required: false })
  @IsEnum(EnrollmentStatus)
  @IsOptional()
  enrollmentStatus?: EnrollmentStatus;
}
