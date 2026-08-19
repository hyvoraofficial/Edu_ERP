import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';

export enum ExamType {
  TERM = 'term',
  FINAL = 'final',
  QUIZ = 'quiz',
  CLASS_TEST = 'class_test',
  MID_TERM = 'mid_term'
}

export class CreateExamDto {
  @ApiProperty({ example: 'First Terminal Examination 2026', description: 'Name of the exam schedule block' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Syllabus testing for term 1 modules', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'term', enum: ExamType })
  @IsEnum(ExamType)
  @IsNotEmpty()
  examType: ExamType;

  @ApiProperty({ example: '2026-09-10', description: 'Date YYYY-MM-DD' })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({ example: '2026-09-20', description: 'Date YYYY-MM-DD' })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;
}
