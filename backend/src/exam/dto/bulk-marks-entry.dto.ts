import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { EnterMarksDto } from './enter-marks.dto';

export class BulkMarksEntryDto {
  @ApiProperty({ example: 'ep111111-1111-1111-1111-111111111111', description: 'Exam Paper UUID' })
  @IsUUID()
  @IsNotEmpty()
  examPaperId: string;

  @ApiProperty({ type: [EnterMarksDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EnterMarksDto)
  marks: EnterMarksDto[];
}
