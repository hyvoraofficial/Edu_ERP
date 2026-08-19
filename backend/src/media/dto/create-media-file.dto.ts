import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsNumber } from 'class-validator';

export enum AccessLevel {
  PUBLIC = 'public',
  PRIVATE = 'private',
  RESTRICTED = 'restricted'
}

export class CreateMediaFileDto {
  @ApiProperty({ example: 'homework_assignment.pdf', description: 'Original filename' })
  @IsString()
  @IsNotEmpty()
  originalFilename: string;

  @ApiProperty({ example: 'application/pdf', description: 'Mime type description' })
  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @ApiProperty({ example: 2048500, description: 'File size in bytes' })
  @IsNumber()
  @IsNotEmpty()
  fileSize: number;

  @ApiProperty({ example: 'private', enum: AccessLevel })
  @IsEnum(AccessLevel)
  @IsNotEmpty()
  accessLevel: AccessLevel;
}
