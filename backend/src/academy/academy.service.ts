import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademyDto } from './dto/create-academy.dto';
import { UpdateAcademySettingsDto } from './dto/update-academy-settings.dto';
import { UpdateAcademyStatusDto } from './dto/update-academy-status.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Injectable()
export class AcademyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAcademyDto) {
    // Check subdomain uniqueness
    const subdomainExists = await this.prisma.academy.findUnique({
      where: { subdomain: dto.subdomain },
    });
    if (subdomainExists) {
      throw new BadRequestException(`Subdomain "${dto.subdomain}" is already registered.`);
    }

    if (dto.domain) {
      const domainExists = await this.prisma.academy.findUnique({
        where: { domain: dto.domain },
      });
      if (domainExists) {
        throw new BadRequestException(`Custom domain "${dto.domain}" is already mapped.`);
      }
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Create Academy
      const academy = await tx.academy.create({
        data: {
          name: dto.name,
          subdomain: dto.subdomain,
          domain: dto.domain,
          status: 'active',
        },
      });

      // 2. Initialize default AcademySettings
      await tx.academySetting.create({
        data: {
          academyId: academy.id,
          primaryColor: '#4F46E5', // Default platform indigo
          secondaryColor: '#06B6D4', // Default platform cyan
          theme: 'light',
          timezone: 'Asia/Kolkata',
          currency: 'INR',
        },
      });

      return academy;
    });
  }

  async findAll() {
    return this.prisma.academy.findMany({
      where: { deletedAt: null },
      include: {
        settings: true,
        subscriptions: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const academy = await this.prisma.academy.findFirst({
      where: { id, deletedAt: null },
      include: {
        settings: true,
        subscriptions: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!academy) {
      throw new NotFoundException(`Academy with ID "${id}" not found.`);
    }

    return academy;
  }

  async updateSettings(academyId: string, dto: UpdateAcademySettingsDto) {
    // Assert settings row presence (init if missing)
    const settingsExists = await this.prisma.academySetting.findUnique({
      where: { academyId },
    });

    if (!settingsExists) {
      return this.prisma.academySetting.create({
        data: {
          academyId,
          ...dto,
        },
      });
    }

    return this.prisma.academySetting.update({
      where: { academyId },
      data: dto,
    });
  }

  async updateStatus(id: string, dto: UpdateAcademyStatusDto) {
    const academy = await this.prisma.academy.findFirst({
      where: { id, deletedAt: null },
    });

    if (!academy) {
      throw new NotFoundException(`Academy with ID "${id}" not found.`);
    }

    return this.prisma.academy.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  async addSubscription(academyId: string, dto: CreateSubscriptionDto) {
    const academy = await this.prisma.academy.findFirst({
      where: { id: academyId, deletedAt: null },
    });

    if (!academy) {
      throw new NotFoundException(`Academy with ID "${academyId}" not found.`);
    }

    return this.prisma.subscription.create({
      data: {
        academyId,
        planName: dto.planName,
        price: dto.price,
        billingCycle: dto.billingCycle,
        startsAt: new Date(dto.startsAt),
        endsAt: new Date(dto.endsAt),
        trialEndsAt: dto.trialEndsAt ? new Date(dto.trialEndsAt) : null,
      },
    });
  }

  async remove(id: string) {
    const academy = await this.prisma.academy.findFirst({
      where: { id, deletedAt: null },
    });

    if (!academy) {
      throw new NotFoundException(`Academy with ID "${id}" not found.`);
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx) => {
      // Soft delete academy
      await tx.academy.update({
        where: { id },
        data: { deletedAt: now },
      });

      // Soft delete settings
      await tx.academySetting.update({
        where: { academyId: id },
        data: { deletedAt: now },
      });

      // Soft delete subscriptions
      await tx.subscription.updateMany({
        where: { academyId: id },
        data: { deletedAt: now },
      });

      return { id, deleted: true };
    });
  }
}
