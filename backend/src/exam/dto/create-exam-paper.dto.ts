import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsDateString, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateExamPaperDto {
  @ApiProperty({ example: 'ex111111-1111-1111-1111-111111111111', description: 'Exam UUID' })
  @IsUUID()
  @IsNotEmpty()
  examId: string;

  @ApiProperty({ example: 'sub11111-1111-1111-1111-111111111111', description: 'Subject UUID' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 'b1111111-1111-1111-1111-111111111111', description: 'Batch UUID' })
  @IsUUID()
  @IsNotEmpty()
  batchId: string;

  @ApiProperty({ example: '2026-09-12', description: 'Exam paper date (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  examDate: string;

  @ApiProperty({ example: '10:00', description: 'Exam start time (HH:MM)' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: 180, description: 'Duration of exam in minutes' })
  @IsNumber()
  @IsNotEmpty()
  durationMinutes: number;

  @ApiProperty({ example: 100.00, description: 'Maximum marks possible' })
  @IsNumber()
  @IsNotEmpty()
  maxMarks: number;

  @ApiProperty({ example: 35.00, description: 'Passing marks required' })
  @IsNumber()
  @IsNotEmpty()
  passingMarks: number;

  @ApiProperty({ example: 'f3333333-3333-3333-3333-333333333333', description: 'Media file UUID question paper', required: false })
  @IsUUID()
  @IsOptional()
  questionPaperId?: string;
}
