import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateScheduleDto {
  @ApiProperty({ example: 'b1111111-1111-1111-1111-111111111111', description: 'Batch UUID' })
  @IsUUID()
  @IsNotEmpty()
  batchId: string;

  @ApiProperty({ example: 'sub11111-1111-1111-1111-111111111111', description: 'Subject UUID' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiProperty({ example: 't1111111-1111-1111-1111-111111111111', description: 'Teacher UUID' })
  @IsUUID()
  @IsNotEmpty()
  teacherId: string;

  @ApiProperty({ example: 'Monday', description: 'Day of week (Monday to Sunday)' })
  @IsString()
  @IsNotEmpty()
  dayOfWeek: string;

  @ApiProperty({ example: '09:00', description: 'Class start time (HH:MM format)' })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({ example: '10:00', description: 'Class end time (HH:MM format)' })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({ example: 'Classroom-102', description: 'Room allocations', required: false })
  @IsString()
  @IsOptional()
  room?: string;
}
