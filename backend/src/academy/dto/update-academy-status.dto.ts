import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export enum AcademyStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive'
}

export class UpdateAcademyStatusDto {
  @ApiProperty({ example: 'active', enum: AcademyStatus })
  @IsEnum(AcademyStatus, { message: 'Status must be active, suspended, or inactive.' })
  @IsNotEmpty()
  status: AcademyStatus;
}
