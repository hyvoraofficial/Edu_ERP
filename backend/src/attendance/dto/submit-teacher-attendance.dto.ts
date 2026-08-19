import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsDateString, IsArray, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class TeacherAttendanceRecordDto {
  @ApiProperty({ example: 't1111111-1111-1111-1111-111111111111', description: 'Teacher UUID' })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ example: 'present', description: 'Attendance status (present, absent, late, half_day)' })
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiProperty({ example: 'Left early for doctor appointment', required: false })
  @IsString()
  @IsOptional()
  remarks?: string;
}

export class SubmitTeacherAttendanceDto {
  @ApiProperty({ example: '2026-07-29', description: 'Date of attendance register (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ type: [TeacherAttendanceRecordDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeacherAttendanceRecordDto)
  records: TeacherAttendanceRecordDto[];
}
