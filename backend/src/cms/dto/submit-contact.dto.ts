import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail } from 'class-validator';

export class SubmitContactDto {
  @ApiProperty({ example: 'Ramesh Kumar', description: 'Sender full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'ramesh@gmail.com', description: 'Contact email' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '+91-9876543210', description: 'Contact phone' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Admissions Inquiry Term 2', required: false })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: 'Please send admission deadline dates details.', description: 'Brief message text' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
