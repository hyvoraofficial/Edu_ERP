import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsUUID, IsEnum, IsArray, IsNumber } from 'class-validator';
import { AccessLevel } from './create-study-material.dto';

export enum VideoProvider {
  YOUTUBE = 'youtube',
  VIMEO = 'vimeo',
  CUSTOM = 'custom',
  EXTERNAL = 'external'
}

export class CreateVideoLectureDto {
  @ApiProperty({ example: 'Limits and Continuity Lecture-1', description: 'Title of video lecture' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Basic definition of limits, functions continuity', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 'sub11111-1111-1111-1111-111111111111', description: 'Subject UUID', required: false })
  @IsUUID()
  @IsOptional()
  subjectId?: string;

  @ApiProperty({ example: 'f3333333-3333-3333-3333-333333333333', description: 'Supabase storage media file UUID for custom provider', required: false })
  @IsUUID()
  @IsOptional()
  mediaFileId?: string;

  @ApiProperty({ example: 'https://youtube.com/watch?v=12345', description: 'URL of external host', required: false })
  @IsString()
  @IsOptional()
  externalVideoUrl?: string;

  @ApiProperty({ example: 'youtube', enum: VideoProvider })
  @IsEnum(VideoProvider)
  @IsNotEmpty()
  videoProvider: VideoProvider;

  @ApiProperty({ example: 'f3333333-3333-3333-3333-333333333334', description: 'Lecture thumbnail media file UUID', required: false })
  @IsUUID()
  @IsOptional()
  thumbnailId?: string;

  @ApiProperty({ example: 3600, description: 'Duration of video in seconds', required: false })
  @IsNumber()
  @IsOptional()
  durationSeconds?: number;

  @ApiProperty({ example: 'batch_only', enum: AccessLevel })
  @IsEnum(AccessLevel)
  @IsNotEmpty()
  accessLevel: AccessLevel;

  @ApiProperty({ example: ['b1111111-1111-1111-1111-111111111111'], description: 'Batches mapped to this video lecture', required: false })
  @IsArray()
  @IsOptional()
  batchIds?: string[];
}
