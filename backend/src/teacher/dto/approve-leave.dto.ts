import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum LeaveStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export class ApproveLeaveDto {
  @ApiProperty({ example: 'approved', enum: LeaveStatus })
  @IsEnum(LeaveStatus)
  @IsNotEmpty()
  status: LeaveStatus;
}
