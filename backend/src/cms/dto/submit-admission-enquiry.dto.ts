import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsUUID, IsEmail, IsOptional } from 'class-validator';

export class SubmitAdmissionEnquiryDto {
  @ApiProperty({ example: 'Suresh', description: 'Student first name' })
  @IsString()
  @IsNotEmpty()
  studentFirstName: string;

  @ApiProperty({ example: 'Kumar', description: 'Student last name' })
  @IsString()
  @IsNotEmpty()
  studentLastName: string;

  @ApiProperty({ example: '2016-05-15', description: 'Student DOB (YYYY-MM-DD)' })
  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @ApiProperty({ example: 'c1111111-1111-1111-1111-111111111111', description: 'Target Course UUID', required: false })
  @IsUUID()
  @IsOptional()
  courseId?: string;

  @ApiProperty({ example: 'Mrs. Sharma', description: 'Parent guardian name' })
  @IsString()
  @IsNotEmpty()
  parentName: string;

  @ApiProperty({ example: '+91-9876543212', description: 'Parent contact phone' })
  @IsString()
  @IsNotEmpty()
  parentPhone: string;

  @ApiProperty({ example: 'parent.sharma@gmail.com', description: 'Parent contact email', required: false })
  @IsEmail()
  @IsOptional()
  parentEmail?: string;
}
