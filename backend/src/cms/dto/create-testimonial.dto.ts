import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsNumber, IsBoolean } from 'class-validator';

export class CreateTestimonialDto {
  @ApiProperty({ example: 'Mrs. Anjali Sharma', description: 'Author of testimonial' })
  @IsString()
  @IsNotEmpty()
  authorName: string;

  @ApiProperty({ example: 'Parent of Class-X student', description: 'Institutional description of author' })
  @IsString()
  @IsNotEmpty()
  authorRole: string;

  @ApiProperty({ example: 'The school portal has made it extremely convenient to track homework grades.', description: 'Feedback review text context' })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({ example: 'f3333333-3333-3333-3333-333333333333', description: 'Profile avatar image media UUID', required: false })
  @IsUUID()
  @IsOptional()
  avatarId?: string;

  @ApiProperty({ example: 5, description: 'Star rating (1 to 5)', required: false })
  @IsNumber()
  @IsOptional()
  rating?: number;

  @ApiProperty({ example: true, description: 'Feature display priority status', required: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}
