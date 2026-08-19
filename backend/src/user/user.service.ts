import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // USER OPERATIONS
  // ==========================================

  async findAll(
    academyId: string,
    filters: { search?: string; page?: number; limit?: number }
  ) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      academyId,
      deletedAt: null,
    };

    if (filters.search) {
      whereClause.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: whereClause,
        include: {
          userRoles: {
            where: { deletedAt: null },
            include: { role: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where: whereClause }),
    ]);

    const formattedUsers = users.map((u: any) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      phone: u.phone,
      status: u.status,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      roles: u.userRoles.map((ur: any) => ur.role.code),
    }));

    return {
      users: formattedUsers,
      meta: {
        total,
        page,
        limit,
      },
    };
  }

  async findOne(academyId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, academyId, deletedAt: null },
      include: {
        userRoles: {
          where: { deletedAt: null },
          include: {
            role: {
              include: {
                permissions: {
                  where: { deletedAt: null },
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    // Extract deduplicated permission codes
    const permissions = new Set<string>();
    user.userRoles.forEach((ur: any) => {
      ur.role.permissions.forEach((rp: any) => {
        if (rp.permission) {
          permissions.add(rp.permission.code);
        }
      });
    });

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      roles: user.userRoles.map((ur: any) => ur.role.code),
      permissions: Array.from(permissions),
    };
  }

  async create(academyId: string, dto: CreateUserDto) {
    // Check user uniqueness within tenant space
    const userExists = await this.prisma.user.findFirst({
      where: { academyId, email: dto.email, deletedAt: null },
    });
    if (userExists) {
      throw new BadRequestException(`Email "${dto.email}" is already registered.`);
    }

    // Lookup specified roles within academy space or globally
    const roles = await this.prisma.role.findMany({
      where: {
        code: { in: dto.roleCodes },
        OR: [{ academyId }, { academyId: null }],
        deletedAt: null,
      },
    });

    if (roles.length !== dto.roleCodes.length) {
      throw new BadRequestException('One or more of the specified role codes is invalid.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);

    return this.prisma.$transaction(async (tx: any) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          academyId,
          email: dto.email,
          passwordHash: hashedPassword,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          status: 'active',
        },
      });

      // 2. Map Roles
      const userRoleMappings = roles.map((role: any) => ({
        academyId,
        userId: user.id,
        roleId: role.id,
      }));

      await tx.userRole.createMany({
        data: userRoleMappings,
      });

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: dto.roleCodes,
      };
    });
  }

  async update(academyId: string, id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({
      where: { id, academyId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: dto,
    });

    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      status: updated.status,
    };
  }

  async remove(academyId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, academyId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx: any) => {
      await tx.user.update({
        where: { id },
        data: { deletedAt: now },
      });

      await tx.userRole.updateMany({
        where: { userId: id, academyId },
        data: { deletedAt: now },
      });

      return { id, deleted: true };
    });
  }

  async assignRoles(academyId: string, userId: string, roleCodes: string[]) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, academyId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found.`);
    }

    const roles = await this.prisma.role.findMany({
      where: {
        code: { in: roleCodes },
        OR: [{ academyId }, { academyId: null }],
        deletedAt: null,
      },
    });

    if (roles.length !== roleCodes.length) {
      throw new BadRequestException('One or more of the specified role codes is invalid.');
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx: any) => {
      // Soft-delete current user role mappings
      await tx.userRole.updateMany({
        where: { userId, academyId, deletedAt: null },
        data: { deletedAt: now },
      });

      // Insert new user role mappings
      const mappings = roles.map((r: any) => ({
        academyId,
        userId,
        roleId: r.id,
      }));

      await tx.userRole.createMany({
        data: mappings,
      });

      return { userId, roles: roleCodes };
    });
  }

  // ==========================================
  // ROLE & PERMISSION OPERATIONS
  // ==========================================

  async findAllRoles(academyId: string) {
    return this.prisma.role.findMany({
      where: {
        OR: [{ academyId }, { academyId: null }],
        deletedAt: null,
      },
      include: {
        permissions: {
          where: { deletedAt: null },
          include: { permission: true },
        },
      },
    });
  }

  async createRole(academyId: string, dto: CreateRoleDto) {
    const roleExists = await this.prisma.role.findFirst({
      where: {
        academyId,
        code: dto.code,
        deletedAt: null,
      },
    });

    if (roleExists) {
      throw new BadRequestException(`Role with code "${dto.code}" is already defined in this Academy.`);
    }

    return this.prisma.$transaction(async (tx: any) => {
      // 1. Create Role
      const role = await tx.role.create({
        data: {
          academyId,
          name: dto.name,
          code: dto.code.toUpperCase(),
          description: dto.description,
          isSystem: false,
        },
      });

      // 2. Map Permissions if present
      if (dto.permissionCodes && dto.permissionCodes.length > 0) {
        const permissions = await tx.permission.findMany({
          where: { code: { in: dto.permissionCodes }, deletedAt: null },
        });

        if (permissions.length !== dto.permissionCodes.length) {
          throw new BadRequestException('One or more permission codes are invalid.');
        }

        const mappings = permissions.map((p: any) => ({
          academyId,
          roleId: role.id,
          permissionId: p.id,
        }));

        await tx.rolePermission.createMany({
          data: mappings,
        });
      }

      return role;
    });
  }

  async assignPermissions(academyId: string, roleId: string, permissionCodes: string[]) {
    const role = await this.prisma.role.findFirst({
      where: { id: roleId, academyId, deletedAt: null },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found in this Academy.`);
    }

    const permissions = await this.prisma.permission.findMany({
      where: { code: { in: permissionCodes }, deletedAt: null },
    });

    if (permissions.length !== permissionCodes.length) {
      throw new BadRequestException('One or more of the specified permission codes is invalid.');
    }

    const now = new Date();

    return this.prisma.$transaction(async (tx: any) => {
      // Soft-delete current mappings
      await tx.rolePermission.updateMany({
        where: { roleId, academyId, deletedAt: null },
        data: { deletedAt: now },
      });

      // Insert new mappings
      const mappings = permissions.map((p: any) => ({
        academyId,
        roleId,
        permissionId: p.id,
      }));

      await tx.rolePermission.createMany({
        data: mappings,
      });

      return { roleId, permissions: permissionCodes };
    });
  }

  async findAllPermissions() {
    return this.prisma.permission.findMany({
      where: { deletedAt: null },
      orderBy: { resource: 'asc' },
    });
  }
}
