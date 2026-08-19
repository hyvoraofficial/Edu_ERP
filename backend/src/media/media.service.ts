import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from './storage.service';
import { CreateMediaFileDto, AccessLevel } from './dto/create-media-file.dto';
import * as path from 'path';

@Injectable()
export class MediaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  // ==========================================
  // TYPE & SIZE VALIDATION
  // ==========================================

  private validateFile(originalFilename: string, mimeType: string, fileSize: number) {
    const ext = path.extname(originalFilename).toLowerCase();
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.mp4', '.doc', '.docx', '.xls', '.xlsx'];
    
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(`File extension "${ext}" is not supported.`);
    }

    // Size limit checking: max 50MB (52428800 bytes)
    const maxLimit = 52428800;
    if (fileSize > maxLimit) {
      throw new BadRequestException('File size exceeds the maximum limit of 50MB.');
    }
  }

  // ==========================================
  // SIGNED URLS & UPLOADS
  // ==========================================

  async generatePresignedUploadUrl(academyId: string, userId: string, dto: CreateMediaFileDto) {
    this.validateFile(dto.originalFilename, dto.mimeType, dto.fileSize);

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const sanitizedFilename = dto.originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_');
    const storagePath = `${academyId}/media/${uniqueId}_${sanitizedFilename}`;
    const bucketName = process.env.STORAGE_BUCKET_NAME || 'study-materials';

    // Save record to prisma metadata table
    const media = await this.prisma.mediaFile.create({
      data: {
        academyId,
        filename: sanitizedFilename,
        originalFilename: dto.originalFilename,
        mimeType: dto.mimeType,
        fileSize: BigInt(dto.fileSize),
        storagePath,
        bucketName,
        accessLevel: dto.accessLevel,
        uploadedBy: userId,
      },
    });

    const signedUrl = await this.storageService.createSignedUrl(bucketName, storagePath, 3600);

    return {
      id: media.id,
      uploadUrl: signedUrl || `https://supabase.co/storage/v1/object/${bucketName}/${storagePath}`,
      storagePath,
      bucketName,
      accessLevel: media.accessLevel,
    };
  }

  async generateSignedDownloadUrl(academyId: string, id: string) {
    const media = await this.prisma.mediaFile.findFirst({
      where: { id, academyId, deletedAt: null },
    });

    if (!media) {
      throw new NotFoundException('Media asset profile not found.');
    }

    const bucket = media.bucketName || process.env.STORAGE_BUCKET_NAME || 'study-materials';
    const signedUrl = await this.storageService.createSignedUrl(bucket, media.storagePath, 3600);

    return {
      id: media.id,
      downloadUrl: signedUrl || `https://supabase.co/storage/v1/object/${bucket}/${media.storagePath}`,
      filename: media.originalFilename,
      mimeType: media.mimeType,
    };
  }

  async deleteFile(academyId: string, id: string) {
    const media = await this.prisma.mediaFile.findFirst({
      where: { id, academyId, deletedAt: null },
    });

    if (!media) {
      throw new NotFoundException('Media asset not found.');
    }

    // soft delete record in DB
    await this.prisma.mediaFile.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Mock storage API call: s3Client.send(new DeleteObjectCommand({ Bucket: media.bucketName, Key: media.storagePath }))

    return { id, deleted: true };
  }
}
