import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'b1111111-1111-1111-1111-111111111111', description: 'Batch UUID' })
  @IsUUID()
  @IsNotEmpty()
  batchId: string;

  @ApiProperty({ example: 'sub11111-1111-1111-1111-111111111111', description: 'Subject UUID' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 'Maths Calculus Assignment 1', description: 'Title of the assignment' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Solve questions in pdf chapter 4 exercise 1', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 100.00, description: 'Maximum marks possible' })
  @IsNumber()
  @IsNotEmpty()
  maxMarks: number;

  @ApiProperty({ example: '2026-08-15T23:59:00.000Z', description: 'Assignment due date (ISO string)' })
  @IsDateString()
  @IsNotEmpty()
  dueDate: string;

  @ApiProperty({ example: 'f3333333-3333-3333-3333-333333333333', description: 'Media attachment file UUID', required: false })
  @IsUUID()
  @IsOptional()
  mediaFileId?: string;
}
