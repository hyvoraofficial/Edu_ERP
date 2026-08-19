import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { SendNotificationDto } from './dto/send-notification.dto';
import { TriggerTemplateDto } from './dto/trigger-template.dto';

@Injectable()
export class NotificationService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // TEMPLATE OPERATIONS
  // ==========================================

  async createTemplate(academyId: string, dto: CreateTemplateDto) {
    const exists = await this.prisma.notificationTemplate.findFirst({
      where: { academyId, name: dto.name, type: dto.type, deletedAt: null },
    });

    if (exists) {
      throw new BadRequestException(`Template "${dto.name}" for delivery type "${dto.type}" is already configured.`);
    }

    return this.prisma.notificationTemplate.create({
      data: {
        academyId,
        name: dto.name.toUpperCase(),
        subject: dto.subject || null,
        body: dto.body,
        type: dto.type,
      },
    });
  }

  async findTemplates(academyId: string) {
    return this.prisma.notificationTemplate.findMany({
      where: { academyId, deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async removeTemplate(academyId: string, id: string) {
    const template = await this.prisma.notificationTemplate.findFirst({
      where: { id, academyId, deletedAt: null },
    });

    if (!template) {
      throw new NotFoundException(`Template with ID "${id}" not found.`);
    }

    return this.prisma.notificationTemplate.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ==========================================
  // DISPATCH & delivery QUEUE OPERATIONS
  // ==========================================

  // Mock async queue handler thread
  private async dispatchAsync(notificationId: string, type: string) {
    // Mimic network transit latencies
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Simulate WhatsApp structure verification checking
      if (type === 'whatsapp') {
        // Placeholder check WhatsApp endpoints
      }

      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'sent' },
      });
    } catch (err: any) {
      await this.prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'failed', failureReason: err.message || 'Transit failure.' },
      });
    }
  }

  async sendDirect(academyId: string, dto: SendNotificationDto) {
    // Ensure recipient exists
    const user = await this.prisma.user.findFirst({
      where: { id: dto.userId, academyId, deletedAt: null },
    });
    if (!user) throw new BadRequestException('Recipient user not found.');

    // 1. Create a queued log entry in PG
    const notification = await this.prisma.notification.create({
      data: {
        academyId,
        userId: dto.userId,
        title: dto.title,
        message: dto.message,
        type: dto.type,
        status: 'queued',
      },
    });

    // 2. Dispatch asynchronously (Queue Support)
    this.dispatchAsync(notification.id, dto.type);

    return {
      notificationId: notification.id,
      status: 'queued',
    };
  }

  async triggerTemplate(academyId: string, dto: TriggerTemplateDto) {
    // 1. Resolve template
    const template = await this.prisma.notificationTemplate.findFirst({
      where: { academyId, name: dto.templateName.toUpperCase(), deletedAt: null },
    });

    if (!template) {
      throw new NotFoundException(`Template "${dto.templateName}" not found.`);
    }

    // 2. Interpolate dynamic template string variables
    let body = template.body;
    Object.entries(dto.variables).forEach(([key, val]) => {
      body = body.replace(new RegExp(`{{${key}}}`, 'g'), val);
    });

    // 3. Dispatch direct message
    return this.sendDirect(academyId, {
      userId: dto.userId,
      title: template.subject || 'System Notification Alert',
      message: body,
      type: template.type as any,
    });
  }

  async findUserNotifications(academyId: string, userId: string) {
    return this.prisma.notification.findMany({
      where: { userId, academyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(academyId: string, id: string) {
    const notification = await this.prisma.notification.findFirst({
      where: { id, academyId, deletedAt: null },
    });

    if (!notification) {
      throw new NotFoundException(`Notification details with ID "${id}" not found.`);
    }

    return this.prisma.notification.update({
      where: { id },
      data: {
        status: 'read',
        readAt: new Date(),
      },
    });
  }

  async getLogs(academyId: string) {
    return this.prisma.notification.findMany({
      where: { academyId, deletedAt: null },
      include: {
        user: {
          select: { firstName: true, lastName: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Limit log listing checks
    });
  }
}
