import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class GradeSubmissionDto {
  @ApiProperty({ example: 85.50, description: 'Marks obtained by the student' })
  @IsNumber()
  @IsNotEmpty()
  marksObtained: number;

  @ApiProperty({ example: 'Good understanding of calculus concepts. Hand writing can be improved.', required: false })
  @IsString()
  @IsOptional()
  teacherRemarks?: string;
}
