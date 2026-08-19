import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { SubmitAssignmentDto } from './dto/submit-assignment.dto';
import { GradeSubmissionDto } from './dto/grade-submission.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AssignmentService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // ASSIGNMENT CRUD OPERATIONS
  // ==========================================

  async create(academyId: string, teacherId: string, dto: CreateAssignmentDto) {
    // Validate teacher exists
    const teacher = await this.prisma.teacher.findFirst({
      where: { userId: teacherId, academyId, deletedAt: null },
    });
    if (!teacher) {
      throw new BadRequestException('User is not mapped as an institutional teacher.');
    }

    // Validate batch
    const batch = await this.prisma.batch.findFirst({
      where: { id: dto.batchId, academyId, deletedAt: null },
    });
    if (!batch) {
      throw new BadRequestException('Batch is invalid or deactivated.');
    }

    // Validate subject
    const subject = await this.prisma.subject.findFirst({
      where: { id: dto.subjectId, academyId, deletedAt: null },
    });
    if (!subject) {
      throw new BadRequestException('Subject is invalid or deactivated.');
    }

    const maxMarksDecimal = new Prisma.Decimal(dto.maxMarks.toString());

    return this.prisma.assignment.create({
      data: {
        academyId,
        batchId: dto.batchId,
        subjectId: dto.subjectId,
        teacherId: teacher.id,
        title: dto.title,
        description: dto.description,
        maxMarks: maxMarksDecimal,
        dueDate: new Date(dto.dueDate),
        mediaFileId: dto.mediaFileId || null,
      },
    });
  }

  async findAll(academyId: string, filters: { batchId?: string; subjectId?: string }) {
    const whereClause: any = { academyId, deletedAt: null };
    if (filters.batchId) whereClause.batchId = filters.batchId;
    if (filters.subjectId) whereClause.subjectId = filters.subjectId;

    return this.prisma.assignment.findMany({
      where: whereClause,
      include: {
        batch: true,
        subject: true,
        teacher: { include: { user: true } },
        _count: {
          select: { submissions: { where: { deletedAt: null } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(academyId: string, id: string) {
    const assignment = await this.prisma.assignment.findFirst({
      where: { id, academyId, deletedAt: null },
      include: {
        batch: true,
        subject: true,
        teacher: { include: { user: true } },
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment with ID "${id}" not found.`);
    }

    return assignment;
  }

  async remove(academyId: string, id: string) {
    const assignment = await this.findOne(academyId, id);

    return this.prisma.$transaction(async (tx: any) => {
      await tx.assignment.update({
        where: { id: assignment.id },
        data: { deletedAt: new Date() },
      });

      await tx.assignmentSubmission.updateMany({
        where: { assignmentId: assignment.id, academyId },
        data: { deletedAt: new Date() },
      });

      return { id: assignment.id, deleted: true };
    });
  }

  // ==========================================
  // STUDENT SUBMISSION OPERATIONS
  // ==========================================

  async submit(academyId: string, userId: string, assignmentId: string, dto: SubmitAssignmentDto) {
    const student = await this.prisma.student.findFirst({
      where: { userId, academyId, deletedAt: null },
    });

    if (!student) {
      throw new BadRequestException('User is not authorized as an enrolled student.');
    }

    const assignment = await this.prisma.assignment.findFirst({
      where: { id: assignmentId, academyId, deletedAt: null },
    });

    if (!assignment) {
      throw new NotFoundException('Assignment profile not found.');
    }

    const now = new Date();
    // Compare dates: late submission checker
    const status = now > assignment.dueDate ? 'late_submission' : 'submitted';

    return this.prisma.assignmentSubmission.upsert({
      where: {
        uq_assignment_submission: {
          assignmentId,
          studentId: student.id,
        },
      },
      update: {
        submissionDate: now,
        mediaFileId: dto.mediaFileId,
        studentRemarks: dto.studentRemarks,
        status,
        deletedAt: null,
      },
      create: {
        academyId,
        assignmentId,
        studentId: student.id,
        submissionDate: now,
        mediaFileId: dto.mediaFileId,
        studentRemarks: dto.studentRemarks,
        status,
      },
    });
  }

  async findSubmissions(academyId: string, assignmentId: string) {
    return this.prisma.assignmentSubmission.findMany({
      where: { assignmentId, academyId, deletedAt: null },
      include: {
        student: { include: { user: true } },
      },
      orderBy: { submissionDate: 'desc' },
    });
  }

  async findOneSubmission(academyId: string, submissionId: string) {
    const submission = await this.prisma.assignmentSubmission.findFirst({
      where: { id: submissionId, academyId, deletedAt: null },
      include: {
        assignment: true,
        student: { include: { user: true } },
      },
    });

    if (!submission) {
      throw new NotFoundException('Submission record not found.');
    }

    return submission;
  }

  // ==========================================
  // TEACHER REVIEW & GRADING OPERATIONS
  // ==========================================

  async grade(academyId: string, gradedBy: string, submissionId: string, dto: GradeSubmissionDto) {
    const submission = await this.prisma.assignmentSubmission.findFirst({
      where: { id: submissionId, academyId, deletedAt: null },
      include: { assignment: true },
    });

    if (!submission) {
      throw new NotFoundException('Submission record not found.');
    }

    const marksDecimal = new Prisma.Decimal(dto.marksObtained.toString());
    if (marksDecimal.greaterThan(submission.assignment.maxMarks)) {
      throw new BadRequestException('Grades obtained cannot exceed assignment max marks.');
    }

    return this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        status: 'graded',
        marksObtained: marksDecimal,
        teacherRemarks: dto.teacherRemarks,
        gradedBy,
        gradedAt: new Date(),
      },
    });
  }
}
