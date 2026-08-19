import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsDateString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class StudentAttendanceRecordDto {
  @ApiProperty({ example: 's1111111-1111-1111-1111-111111111111', description: 'Student UUID' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ example: 'present', description: 'Attendance status (present, absent, late, excused)' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: 'Late due to bus delay', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class SubmitStudentAttendanceDto {
  @ApiProperty({ example: 'b1111111-1111-1111-1111-111111111111', description: 'Batch UUID' })
  @IsUUID()
  @IsNotEmpty()
  batchId: string;

  @ApiProperty({ example: 'sub11111-1111-1111-1111-111111111111', description: 'Subject UUID', required: false })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiProperty({ example: '2026-07-29', description: 'Date of attendance register (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ type: [StudentAttendanceRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentAttendanceRecordDto)
  records: StudentAttendanceRecordDto[];
}
