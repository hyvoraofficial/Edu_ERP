import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsOptional } from 'class-validator';

export class SubmitAssignmentDto {
  @ApiProperty({ example: 'f3333333-3333-3333-3333-333333333335', description: 'Uploaded submission file UUID' })
  @IsUUID()
  @IsNotEmpty()
  mediaFileId: string;

  @ApiProperty({ example: 'Completed questions 1 to 10 in standard formats.', required: false })
  @IsString()
  @IsOptional()
  studentRemarks?: string;
}
