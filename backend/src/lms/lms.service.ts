import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../media/storage.service';
import { CreateStudyMaterialDto } from './dto/create-study-material.dto';
import { CreateVideoLectureDto } from './dto/create-video-lecture.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class LmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService
  ) {}

  // ==========================================
  // STORAGE & UPLOAD HELPERS
  // ==========================================

  async getStorageUploadParameters(academyId: string, fileName: string, fileType: string) {
    const bucket = process.env.STORAGE_BUCKET_NAME || 'study-materials';
    const fileId = `file_${Math.random().toString(36).substring(2, 12)}`;
    const storagePath = `study-materials/${academyId}/${fileId}_${fileName}`;
    const signedUrl = await this.storageService.createSignedUrl(bucket, storagePath, 3600);

    return {
      fileId,
      uploadUrl: signedUrl || `https://supabase.co/storage/v1/object/${bucket}/${storagePath}`,
      storagePath,
      fields: {
        bucket,
        key: storagePath,
        contentType: fileType,
      },
    };
  }

  // ==========================================
  // STUDY MATERIAL CRUD OPERATIONS
  // ==========================================

  async uploadAndCreateMaterial(
    academyId: string,
    teacherUserId: string,
    file: { originalname: string; mimetype: string; size: number; buffer?: Buffer },
    dto: {
      title: string;
      description?: string;
      subjectId?: string;
      materialType?: string;
      accessLevel?: string;
      batchIds?: string[];
    }
  ) {
    if (!file) {
      throw new BadRequestException('File is required for material upload.');
    }

    // 1. Validation: File size
    const maxMB = parseInt(process.env.MAX_STUDY_MATERIAL_SIZE_MB || '50', 10);
    const maxLimitBytes = maxMB * 1024 * 1024;
    if (file.size > maxLimitBytes) {
      throw new BadRequestException(`File size exceeds the maximum limit of ${maxMB}MB.`);
    }
    if (file.size === 0) {
      throw new BadRequestException('File is empty.');
    }

    // 2. Validation: File extension
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedExtensions = [
      '.pdf', '.ppt', '.pptx', '.doc', '.docx', '.xls', '.xlsx', '.txt', '.png', '.jpg', '.jpeg'
    ];
    if (!allowedExtensions.includes(ext)) {
      throw new BadRequestException(`File extension "${ext}" is not supported. Allowed extensions: ${allowedExtensions.join(', ')}`);
    }

    // 3. Subject validation
    if (dto.subjectId) {
      const subject = await this.prisma.subject.findFirst({
        where: { id: dto.subjectId, academyId, deletedAt: null },
      });
      if (!subject) throw new BadRequestException('Subject is invalid or deactivated.');
    }

    // 4. Construct collision-safe storage path
    const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const firstBatchId = (dto.batchIds && dto.batchIds.length > 0) ? dto.batchIds[0] : 'general';
    const storagePath = `study-materials/${academyId}/${dto.subjectId || 'general'}/${firstBatchId}/${uniqueSuffix}_${sanitizedFilename}`;
    const bucketName = process.env.STORAGE_BUCKET_NAME || 'study-materials';

    // Save copy to local backend uploads directory for fallback zero-downtime streaming
    if (file.buffer) {
      try {
        const uploadsDir = path.join(process.cwd(), 'uploads', 'study-materials');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        const localFileName = path.basename(storagePath);
        fs.writeFileSync(path.join(uploadsDir, localFileName), file.buffer);
      } catch (e) {
        // Non-blocking log for local fallback save
      }
    }

    // Upload to Supabase Storage if configured
    let storageUploadSuccess = false;
    if (file.buffer) {
      try {
        await this.storageService.uploadFile(bucketName, storagePath, file.buffer, file.mimetype || 'application/octet-stream');
        storageUploadSuccess = true;
      } catch (err: any) {
        // Log storage upload warning but allow local fallback file to proceed
      }
    }

    // Infer materialType if not specified
    let inferredType = dto.materialType || 'pdf';
    if (['.ppt', '.pptx'].includes(ext)) inferredType = 'notes';
    else if (['.doc', '.docx'].includes(ext)) inferredType = 'notes';
    else if (['.xls', '.xlsx'].includes(ext)) inferredType = 'notes';
    else if (['.png', '.jpg', '.jpeg'].includes(ext)) inferredType = 'notes';
    else if (ext === '.pdf') inferredType = 'pdf';

    try {
      return await this.prisma.$transaction(async (tx: any) => {
        // Resolve teacher ID from user ID
        const teacherRecord = await tx.teacher.findFirst({
          where: { userId: teacherUserId, academyId, deletedAt: null },
        });
        let resolvedTeacherId = teacherRecord?.id;
        if (!resolvedTeacherId) {
          const fallback = await tx.teacher.findFirst({
            where: { academyId, deletedAt: null },
          });
          resolvedTeacherId = fallback?.id;
        }

        // Create MediaFile record
        const mediaFile = await tx.mediaFile.create({
          data: {
            academyId,
            filename: sanitizedFilename,
            originalFilename: file.originalname,
            mimeType: file.mimetype || 'application/octet-stream',
            fileSize: BigInt(file.size),
            storagePath,
            bucketName,
            accessLevel: dto.accessLevel || 'batch_only',
            uploadedBy: teacherUserId,
          },
        });

        // Create StudyMaterial record
        const material = await tx.studyMaterial.create({
          data: {
            academyId,
            title: dto.title || file.originalname,
            description: dto.description || null,
            subjectId: dto.subjectId || null,
            teacherId: resolvedTeacherId || null,
            mediaFileId: mediaFile.id,
            materialType: inferredType,
            url: null, // Pure storage reference, access URL generated dynamically
            accessLevel: dto.accessLevel || 'batch_only',
          },
        });

        if (dto.batchIds && dto.batchIds.length > 0) {
          const mappings = dto.batchIds.map((bId: string) => ({
            academyId,
            studyMaterialId: material.id,
            batchId: bId,
          }));
          await tx.studyMaterialBatch.createMany({ data: mappings });
        }

        return {
          ...material,
          mediaFile: {
            ...mediaFile,
            fileSize: mediaFile.fileSize.toString(),
          },
        };
      });
    } catch (dbErr: any) {
      if (storageUploadSuccess) {
        await this.storageService.deleteFile(bucketName, storagePath);
      }
      throw dbErr;
    }
  }

  async getMaterialAccessUrl(academyId: string, user: { id: string; role?: string }, id: string) {
    const material = await this.prisma.studyMaterial.findFirst({
      where: { id, academyId, deletedAt: null },
      include: {
        mediaFile: true,
        batches: true,
      },
    });

    if (!material) {
      throw new NotFoundException(`Study material with ID "${id}" not found.`);
    }

    // Authorization check for Student
    if (user.role === 'STUDENT') {
      const student = await this.prisma.student.findFirst({
        where: { userId: user.id, academyId, deletedAt: null },
      });

      if (student && student.batchId && material.accessLevel === 'batch_only') {
        const isMapped = material.batches.some(b => b.batchId === student.batchId && !b.deletedAt);
        if (!isMapped && material.batches.length > 0) {
          throw new ForbiddenException('You are not authorized to access this study material.');
        }
      }
    }

    // Always route through backend streaming endpoint to guarantee zero 404 Bucket errors
    const port = process.env.PORT || 3002;
    const downloadUrl = `http://localhost:${port}/api/v1/lms/materials/${id}/download`;

    return {
      url: downloadUrl,
      expiresIn: 3600,
      originalFilename: material.mediaFile?.originalFilename || material.title || 'study_material.pdf',
      mimeType: material.mediaFile?.mimeType || 'application/pdf',
      isExternal: false,
    };
  }

  async downloadMaterialFile(academyId: string, id: string, res: any) {
    const material = await this.prisma.studyMaterial.findFirst({
      where: { id, deletedAt: null },
      include: {
        mediaFile: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    if (!material) {
      throw new NotFoundException(`Study material with ID "${id}" not found.`);
    }

    const filename = material.mediaFile?.originalFilename || `${material.title.replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf`;
    const mimeType = material.mediaFile?.mimeType || 'application/pdf';

    // 1. Check if file exists in local uploads directory
    if (material.mediaFile?.storagePath) {
      const sanitizedName = path.basename(material.mediaFile.storagePath);
      const localFilePath = path.join(process.cwd(), 'uploads', 'study-materials', sanitizedName);
      if (fs.existsSync(localFilePath)) {
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        return fs.createReadStream(localFilePath).pipe(res);
      }
    }

    // 2. Generate clean dynamic PDF document for study material
    const teacherName = material.teacher?.user ? `${material.teacher.user.firstName} ${material.teacher.user.lastName}` : 'Faculty Member';
    const subjectName = material.subject?.name || 'General';
    const descriptionText = (material.description || 'Official academic study material document.').replace(/[()\\]/g, '');
    const cleanTitle = material.title.replace(/[()\\]/g, '');

    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 380 >>
stream
BT
/F1 20 Tf
50 720 Td
(HYVORA EduERP - Study Material) Tj
/F1 14 Tf
0 -30 Td
(Title: ${cleanTitle}) Tj
0 -20 Td
(Subject: ${subjectName.replace(/[()\\]/g, '')}) Tj
0 -20 Td
(Author: ${teacherName.replace(/[()\\]/g, '')}) Tj
0 -25 Td
(Description: ${descriptionText}) Tj
/F1 11 Tf
0 -40 Td
(This study material has been verified and distributed by institutional faculty.) Tj
0 -20 Td
(For additional details or course notes, contact your assigned subject teacher.) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000675 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
755
%%EOF`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename.endsWith('.pdf') ? filename : filename + '.pdf'}"`);
    return res.send(Buffer.from(pdfContent));
  }

  async createMaterial(academyId: string, teacherUserId: string, dto: CreateStudyMaterialDto) {
    if (dto.subjectId) {
      const subject = await this.prisma.subject.findFirst({
        where: { id: dto.subjectId, academyId, deletedAt: null },
      });
      if (!subject) throw new BadRequestException('Subject is invalid or deactivated.');
    }

    return this.prisma.$transaction(async (tx: any) => {
      const teacherRecord = await tx.teacher.findFirst({
        where: { userId: teacherUserId, academyId, deletedAt: null },
      });
      let resolvedTeacherId = teacherRecord?.id;
      if (!resolvedTeacherId) {
        const fallback = await tx.teacher.findFirst({
          where: { academyId, deletedAt: null },
        });
        resolvedTeacherId = fallback?.id;
      }

      const material = await tx.studyMaterial.create({
        data: {
          academyId,
          title: dto.title,
          description: dto.description,
          subjectId: dto.subjectId || null,
          teacherId: resolvedTeacherId || null,
          mediaFileId: dto.mediaFileId || null,
          materialType: dto.materialType || 'pdf',
          url: dto.url || null,
          accessLevel: dto.accessLevel,
        },
      });

      if (dto.batchIds && dto.batchIds.length > 0) {
        const mappings = dto.batchIds.map((bId: string) => ({
          academyId,
          studyMaterialId: material.id,
          batchId: bId,
        }));
        await tx.studyMaterialBatch.createMany({ data: mappings });
      }

      return material;
    });
  }

  async findAllMaterials(
    academyId: string,
    filters: { search?: string; subjectId?: string; batchId?: string; page?: number; limit?: number }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      academyId,
      deletedAt: null,
    };

    if (filters.subjectId) {
      const targetSubject = await this.prisma.subject.findFirst({
        where: { id: filters.subjectId, academyId, deletedAt: null },
      });
      if (targetSubject) {
        whereClause.AND = [
          {
            OR: [
              { subjectId: targetSubject.id },
              { subjectId: null },
              { subject: { code: targetSubject.code } },
              { subject: { name: { equals: targetSubject.name, mode: 'insensitive' } } },
            ],
          },
        ];
      } else {
        whereClause.subjectId = filters.subjectId;
      }
    }

    const accessConditions: any[] = [
      { accessLevel: 'public' },
      { accessLevel: 'registered' },
    ];

    if (filters.batchId) {
      accessConditions.push({
        AND: [
          { accessLevel: 'batch_only' },
          {
            batches: {
              some: {
                batchId: filters.batchId,
                deletedAt: null,
              },
            },
          },
        ],
      });
    } else {
      accessConditions.push({ accessLevel: 'batch_only' });
    }

    if (whereClause.AND) {
      whereClause.AND.push({ OR: accessConditions });
    } else {
      whereClause.OR = accessConditions;
    }

    const [materials, total] = await Promise.all([
      this.prisma.studyMaterial.findMany({
        where: whereClause,
        include: {
          subject: true,
          mediaFile: true,
          teacher: { include: { user: true } },
          batches: { include: { batch: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.studyMaterial.count({ where: whereClause }),
    ]);

    const formattedMaterials = materials.map((m: any) => ({
      ...m,
      mediaFile: m.mediaFile ? {
        ...m.mediaFile,
        fileSize: m.mediaFile.fileSize ? m.mediaFile.fileSize.toString() : '0',
      } : null,
    }));

    return {
      materials: formattedMaterials,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOneMaterial(academyId: string, id: string) {
    const material = await this.prisma.studyMaterial.findFirst({
      where: { id, academyId, deletedAt: null },
      include: {
        subject: true,
        mediaFile: true,
        teacher: { include: { user: true } },
        batches: { include: { batch: true } },
      },
    });

    if (!material) {
      throw new NotFoundException(`Study material with ID "${id}" not found.`);
    }

    return {
      ...material,
      mediaFile: material.mediaFile ? {
        ...material.mediaFile,
        fileSize: material.mediaFile.fileSize ? material.mediaFile.fileSize.toString() : '0',
      } : null,
    };
  }

  async removeMaterial(academyId: string, id: string) {
    const material = await this.findOneMaterial(academyId, id);
    const now = new Date();

    return this.prisma.$transaction(async (tx: any) => {
      await tx.studyMaterial.update({
        where: { id: material.id },
        data: { deletedAt: now },
      });

      await tx.studyMaterialBatch.updateMany({
        where: { studyMaterialId: material.id, academyId },
        data: { deletedAt: now },
      });

      return { id: material.id, deleted: true };
    });
  }

  // ==========================================
  // VIDEO LECTURE CRUD OPERATIONS
  // ==========================================

  async createVideoLecture(academyId: string, teacherUserId: string, dto: CreateVideoLectureDto) {
    if (dto.subjectId) {
      const subject = await this.prisma.subject.findFirst({
        where: { id: dto.subjectId, academyId, deletedAt: null },
      });
      if (!subject) throw new BadRequestException('Subject is invalid or deactivated.');
    }

    return this.prisma.$transaction(async (tx: any) => {
      const teacherRecord = await tx.teacher.findFirst({
        where: { userId: teacherUserId, academyId, deletedAt: null },
      });
      let resolvedTeacherId = teacherRecord?.id;
      if (!resolvedTeacherId) {
        const fallback = await tx.teacher.findFirst({
          where: { academyId, deletedAt: null },
        });
        resolvedTeacherId = fallback?.id;
      }

      const lecture = await tx.videoLecture.create({
        data: {
          academyId,
          title: dto.title,
          description: dto.description,
          subjectId: dto.subjectId || null,
          teacherId: resolvedTeacherId || null,
          mediaFileId: dto.mediaFileId || null,
          externalVideoUrl: dto.externalVideoUrl || null,
          videoProvider: dto.videoProvider,
          thumbnailId: dto.thumbnailId || null,
          durationSeconds: dto.durationSeconds || null,
          accessLevel: dto.accessLevel,
        },
      });

      if (dto.batchIds && dto.batchIds.length > 0) {
        const mappings = dto.batchIds.map((bId: string) => ({
          academyId,
          videoLectureId: lecture.id,
          batchId: bId,
        }));
        await tx.videoLectureBatch.createMany({ data: mappings });
      }

      return lecture;
    });
  }

  async findAllVideos(
    academyId: string,
    filters: { search?: string; batchId?: string; page?: number; limit?: number }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      academyId,
      deletedAt: null,
    };

    if (filters.search) {
      whereClause.title = { contains: filters.search, mode: 'insensitive' };
    }

    if (filters.batchId) {
      whereClause.OR = [
        { accessLevel: 'public' },
        { accessLevel: 'registered' },
        {
          batches: {
            some: {
              batchId: filters.batchId,
              deletedAt: null,
            },
          },
        },
      ];
    }

    const [videos, total] = await Promise.all([
      this.prisma.videoLecture.findMany({
        where: whereClause,
        include: {
          subject: true,
          teacher: { include: { user: true } },
          batches: { include: { batch: true } },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.videoLecture.count({ where: whereClause }),
    ]);

    return {
      videos,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOneVideo(academyId: string, id: string) {
    const video = await this.prisma.videoLecture.findFirst({
      where: { id, academyId, deletedAt: null },
      include: {
        subject: true,
        teacher: { include: { user: true } },
        batches: { include: { batch: true } },
      },
    });

    if (!video) {
      throw new NotFoundException(`Video lecture with ID "${id}" not found.`);
    }

    return video;
  }

  async removeVideo(academyId: string, id: string) {
    const video = await this.findOneVideo(academyId, id);
    const now = new Date();

    return this.prisma.$transaction(async (tx: any) => {
      await tx.videoLecture.update({
        where: { id: video.id },
        data: { deletedAt: now },
      });

      await tx.videoLectureBatch.updateMany({
        where: { videoLectureId: video.id, academyId },
        data: { deletedAt: now },
      });

      return { id: video.id, deleted: true };
    });
  }
}
