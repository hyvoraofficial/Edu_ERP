import { Injectable, NotFoundException } from '@nestjs/common';
import { StudentRepository } from './student.repository';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { AssignBatchDto } from './dto/assign-batch.dto';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StudentService {
  constructor(
    private readonly studentRepository: StudentRepository,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService
  ) {}

  async findAll(
    academyId: string,
    filters: { search?: string; status?: string; branchId?: string; courseId?: string; batchId?: string; limit?: number; page?: number }
  ) {
    return this.studentRepository.findAll(academyId, filters);
  }

  async findOne(academyId: string, id: string) {
    const student = await this.studentRepository.findById(academyId, id);
    if (!student) {
      throw new NotFoundException(`Student profile with ID "${id}" not found.`);
    }
    return student;
  }

  async findOneByUser(academyId: string, userId: string) {
    const student = await this.studentRepository.findByUser(academyId, userId);
    if (!student) {
      throw new NotFoundException(`Student profile not found.`);
    }
    return student;
  }

  async create(academyId: string, dto: CreateStudentDto) {
    const result = await this.studentRepository.create(academyId, dto);

    // Dynamic Login URL formulation (falling back to frontend dev server if domain settings aren't defined)
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3001';
    const loginUrl = `${frontendUrl}/login`;

    // Fire welcome email asynchronously
    this.emailService.sendWelcomeEmail(result.email, {
      academyName: result.branchName ? `Hyvora Academy (${result.branchName} Branch)` : 'Hyvora Academy',
      studentName: `${result.firstName} ${result.lastName}`,
      loginUrl,
      studentEmail: result.email,
      generatedPassword: result.temporaryPassword,
      supportContact: 'support@hyvora.com',
    }).catch(err => {
      // Log errors but do not block response payload return
      console.error('Failed to deliver welcome email:', err);
    });

    return result;
  }

  async update(academyId: string, id: string, dto: UpdateStudentDto) {
    return this.studentRepository.update(academyId, id, dto);
  }

  async remove(academyId: string, id: string, permanent: boolean = false) {
    return this.studentRepository.remove(academyId, id, permanent);
  }

  async assignBatch(academyId: string, studentId: string, dto: AssignBatchDto) {
    return this.studentRepository.assignBatch(academyId, studentId, dto);
  }

  async getAttendanceSummary(academyId: string, studentId: string) {
    await this.findOne(academyId, studentId); // Assert student presence
    return this.studentRepository.getAttendanceSummary(academyId, studentId);
  }

  async getFeeSummary(academyId: string, studentId: string) {
    await this.findOne(academyId, studentId); // Assert student presence
    return this.studentRepository.getFeeSummary(academyId, studentId);
  }

  async updatePhoto(academyId: string, studentId: string, avatarId: string) {
    return this.studentRepository.updatePhoto(academyId, studentId, avatarId);
  }
}
