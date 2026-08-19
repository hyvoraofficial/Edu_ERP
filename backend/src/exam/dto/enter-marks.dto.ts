import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsNumber, IsString, IsOptional, IsEnum } from 'class-validator';

export enum ExamResultStatus {
  PASS = 'pass',
  FAIL = 'fail',
  ABSENT = 'absent',
  MALPRACTICE = 'malpractice'
}

export class EnterMarksDto {
  @ApiProperty({ example: 's1111111-1111-1111-1111-111111111111', description: 'Student UUID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 85.50, description: 'Marks obtained by student', required: false })
  @IsNumber()
  @IsOptional()
  marksObtained?: number;

  @ApiProperty({ example: 'pass', enum: ExamResultStatus })
  @IsEnum(ExamResultStatus)
  @IsNotEmpty()
  status: ExamResultStatus;

  @ApiProperty({ example: 'Excellent execution', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;
}
