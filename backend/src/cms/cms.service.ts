import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePageDto } from './dto/create-page.dto';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { SubmitContactDto } from './dto/submit-contact.dto';
import { SubmitAdmissionEnquiryDto } from './dto/submit-admission-enquiry.dto';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // WEBSITE PAGES CRUD OPERATIONS
  // ==========================================

  async createPage(academyId: string, dto: CreatePageDto) {
    const slugExists = await this.prisma.websitePage.findFirst({
      where: { academyId, slug: dto.slug.toLowerCase(), deletedAt: null },
    });

    if (slugExists) {
      throw new BadRequestException(`Slug path "${dto.slug}" is already mapped.`);
    }

    return this.prisma.websitePage.create({
      data: {
        academyId,
        title: dto.title,
        slug: dto.slug.toLowerCase(),
        content: dto.content,
        status: dto.status,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
      },
    });
  }

  async findAllPages(academyId: string) {
    return this.prisma.websitePage.findMany({
      where: { academyId, deletedAt: null },
      orderBy: { title: 'asc' },
    });
  }

  async findOnePage(academyId: string, slug: string) {
    const page = await this.prisma.websitePage.findFirst({
      where: { academyId, slug: slug.toLowerCase(), deletedAt: null },
    });

    if (!page) {
      throw new NotFoundException(`CMS Page with slug "${slug}" not found.`);
    }

    return page;
  }

  async removePage(academyId: string, id: string) {
    const page = await this.prisma.websitePage.findFirst({
      where: { id, academyId, deletedAt: null },
    });

    if (!page) {
      throw new NotFoundException(`Page details not found.`);
    }

    return this.prisma.websitePage.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ==========================================
  // TESTIMONIALS CRUD OPERATIONS
  // ==========================================

  async createTestimonial(academyId: string, dto: CreateTestimonialDto) {
    return this.prisma.testimonial.create({
      data: {
        academyId,
        authorName: dto.authorName,
        authorRole: dto.authorRole,
        content: dto.content,
        avatarId: dto.avatarId,
        rating: dto.rating,
        isFeatured: dto.isFeatured || false,
      },
    });
  }

  async findAllTestimonials(academyId: string) {
    return this.prisma.testimonial.findMany({
      where: { academyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==========================================
  // CONTACT QUERY OPERATIONS
  // ==========================================

  async submitContact(academyId: string, dto: SubmitContactDto) {
    return this.prisma.contactEnquiry.create({
      data: {
        academyId,
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        subject: dto.subject,
        message: dto.message,
        status: 'pending',
      },
    });
  }

  async findContacts(academyId: string) {
    return this.prisma.contactEnquiry.findMany({
      where: { academyId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async resolveContact(academyId: string, resolvedBy: string, id: string, notes: string) {
    const query = await this.prisma.contactEnquiry.findFirst({
      where: { id, academyId, deletedAt: null },
    });

    if (!query) {
      throw new NotFoundException('Contact query not found.');
    }

    return this.prisma.contactEnquiry.update({
      where: { id },
      data: {
        status: 'resolved',
        responseNotes: notes,
        resolvedBy,
      },
    });
  }

  // ==========================================
  // ADMISSION ENQUIRY OPERATIONS
  // ==========================================

  async submitAdmissionEnquiry(academyId: string, dto: SubmitAdmissionEnquiryDto) {
    if (dto.courseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: dto.courseId, academyId, deletedAt: null },
      });
      if (!course) throw new BadRequestException('Target Course is invalid or deactivated.');
    }

    return this.prisma.admissionEnquiry.create({
      data: {
        academyId,
        studentFirstName: dto.studentFirstName,
        studentLastName: dto.studentLastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        courseId: dto.courseId || null,
        parentName: dto.parentName,
        parentPhone: dto.parentPhone,
        parentEmail: dto.parentEmail,
        status: 'pending',
      },
    });
  }

  async getAdmissionEnquiries(academyId: string) {
    return this.prisma.admissionEnquiry.findMany({
      where: { academyId, deletedAt: null },
      include: { course: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
