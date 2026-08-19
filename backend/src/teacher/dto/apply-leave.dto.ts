import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class ApplyLeaveDto {
  @ApiProperty({ example: 'sick_leave', description: 'Type of leave request (e.g. casual_leave, sick_leave, maternity_leave)' })
  @IsString()
  @IsNotEmpty()
  leaveType: string;

  @ApiProperty({ example: '2026-08-10', description: 'Start date of leave (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  startsAt: string;

  @ApiProperty({ example: '2026-08-12', description: 'End date of leave (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  endsAt: string;

  @ApiProperty({ example: 'Recovering from viral influenza fever', description: 'Reason explanation text for leave', required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
