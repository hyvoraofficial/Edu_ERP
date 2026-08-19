import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum, IsArray } from 'class-validator';

export enum AccessLevel {
  PUBLIC = 'public',
  REGISTERED = 'registered',
  BATCH_ONLY = 'batch_only'
}

export enum MaterialType {
  PDF = 'pdf',
  NOTES = 'notes',
  LINK = 'link',
  YOUTUBE = 'youtube'
}

export class CreateStudyMaterialDto {
  @ApiProperty({ example: 'Introduction to Calculus notes', description: 'Title of the material' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Complete differential calculus notes term-1', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'sub11111-1111-1111-1111-111111111111', description: 'Subject UUID', required: false })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiProperty({ example: 'f3333333-3333-3333-3333-333333333333', description: 'Uploaded Media File UUID', required: false })
  @IsUUID()
  @IsOptional()
  mediaFileId?: string;

  @ApiProperty({ example: 'pdf', enum: MaterialType, required: false })
  @IsEnum(MaterialType)
  @IsOptional()
  materialType?: MaterialType;

  @ApiProperty({ example: 'https://youtube.com/watch?v=123456', description: 'External or YouTube video link URL', required: false })
  @IsString()
  @IsOptional()
  url?: string;

  @ApiProperty({ example: 'batch_only', enum: AccessLevel })
  @IsEnum(AccessLevel)
  @IsNotEmpty()
  accessLevel: AccessLevel;

  @ApiProperty({ example: ['b1111111-1111-1111-1111-111111111111'], description: 'Batches mapped to this study resource', required: false })
  @IsArray()
  @IsOptional()
  batchIds?: string[];
}
