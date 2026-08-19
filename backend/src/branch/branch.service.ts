import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';

@Injectable()
export class BranchService {
  constructor(private readonly prisma: PrismaService) {}

  async create(academyId: string, dto: CreateBranchDto) {
    // 1. Validate branch name uniqueness within the academy
    const existingName = await this.prisma.branch.findFirst({
      where: { academyId, name: dto.name, deletedAt: null },
    });
    if (existingName) {
      throw new ConflictException(`Branch with name "${dto.name}" already exists in this academy.`);
    }

    // 2. Validate branch code uniqueness within the academy
    const existingCode = await this.prisma.branch.findFirst({
      where: { academyId, code: dto.code, deletedAt: null },
    });
    if (existingCode) {
      throw new ConflictException(`Branch with code "${dto.code}" already exists in this academy.`);
    }

    return this.prisma.branch.create({
      data: {
        academyId,
        name: dto.name,
        code: dto.code,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        contactNumber: dto.contactNumber,
        email: dto.email,
        managerId: dto.managerId || null,
        status: dto.status || 'active',
      },
    });
  }

  async findAll(academyId: string, search?: string, status?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    let targetAcademyId = academyId;
    if (targetAcademyId === 'platform' || !targetAcademyId) {
      const defaultAcademy = await this.prisma.academy.findFirst({ where: { deletedAt: null } });
      if (defaultAcademy) targetAcademyId = defaultAcademy.id;
    }

    const where: any = {
      ...(targetAcademyId && targetAcademyId !== 'platform' ? { academyId: targetAcademyId } : {}),
      deletedAt: null,
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.branch.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.branch.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(academyId: string, id: string) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, academyId, deletedAt: null },
    });
    if (!branch) {
      throw new BadRequestException('Branch not found.');
    }
    return branch;
  }

  async update(academyId: string, id: string, dto: UpdateBranchDto) {
    const branch = await this.findOne(academyId, id);

    if (dto.name && dto.name !== branch.name) {
      const existingName = await this.prisma.branch.findFirst({
        where: { academyId, name: dto.name, deletedAt: null, NOT: { id } },
      });
      if (existingName) {
        throw new ConflictException(`Branch with name "${dto.name}" already exists in this academy.`);
      }
    }

    if (dto.code && dto.code !== branch.code) {
      const existingCode = await this.prisma.branch.findFirst({
        where: { academyId, code: dto.code, deletedAt: null, NOT: { id } },
      });
      if (existingCode) {
        throw new ConflictException(`Branch with code "${dto.code}" already exists in this academy.`);
      }
    }

    return this.prisma.branch.update({
      where: { id },
      data: {
        name: dto.name,
        code: dto.code,
        address: dto.address,
        city: dto.city,
        state: dto.state,
        pincode: dto.pincode,
        contactNumber: dto.contactNumber,
        email: dto.email,
        managerId: dto.managerId,
        status: dto.status,
      },
    });
  }

  async remove(academyId: string, id: string, permanent: boolean = false) {
    const branch = await this.prisma.branch.findFirst({
      where: { id, academyId },
    });
    if (!branch) {
      throw new BadRequestException('Branch not found.');
    }

    if (permanent) {
      return this.prisma.$transaction(async (tx: any) => {
        await tx.student.deleteMany({ where: { branchId: id } });
        await tx.teacher.deleteMany({ where: { branchId: id } });
        await tx.batch.deleteMany({ where: { branchId: id } });
        await tx.course.deleteMany({ where: { branchId: id } });
        await tx.branch.delete({ where: { id } });
        return { success: true, message: 'Branch deleted permanently from database.' };
      });
    }

    // Deletion Rules check for soft delete
    const studentCount = await this.prisma.student.count({
      where: { branchId: id, deletedAt: null },
    });
    if (studentCount > 0) {
      throw new BadRequestException(
        `Cannot archive branch "${branch.name}" because it contains ${studentCount} students.`
      );
    }

    // Soft delete
    return this.prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
