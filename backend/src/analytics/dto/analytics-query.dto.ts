import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class AnalyticsQueryDto {
  @ApiProperty({ example: 'batch', description: 'Dimension filter: batch, course, or overall', required: false })
  @IsString()
  @IsOptional()
  dimension?: string;

  @ApiProperty({ example: 'b1111111-1111-1111-1111-111111111111', description: 'Dimension target UUID', required: false })
  @IsUUID()
  @IsOptional()
  dimensionId?: string;

  @ApiProperty({ example: false, description: 'Force re-compute bypass cache parameter', required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  refreshCache?: boolean;
}
