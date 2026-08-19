import { 
  Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards, HttpCode, HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiParam, ApiBearerAuth 
} from '@nestjs/swagger';
import { AcademyService } from './academy.service';
import { CreateAcademyDto } from './dto/create-academy.dto';
import { UpdateAcademySettingsDto } from './dto/update-academy-settings.dto';
import { UpdateAcademyStatusDto } from './dto/update-academy-status.dto';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('Academy Management')
@ApiBearerAuth()
@Controller('academy')
export class AcademyController {
  constructor(private readonly academyService: AcademyService) {}

  // 1. Get settings for active tenant
  @Get('settings')
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:read')
  @ApiOperation({ summary: 'Retrieve settings and branding variables for active tenant' })
  async getSettings(@Req() req: any) {
    const data = await this.academyService.findOne(req.tenant.id);
    return {
      success: true,
      data: data.settings,
      message: 'Active settings fetched successfully.',
    };
  }

  // 2. Update settings for active tenant
  @Patch('settings')
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('settings:update')
  @ApiOperation({ summary: 'Update settings and branding variables for active tenant' })
  async updateSettings(@Req() req: any, @Body() dto: UpdateAcademySettingsDto) {
    const data = await this.academyService.updateSettings(req.tenant.id, dto);
    return {
      success: true,
      data,
      message: 'Active settings updated successfully.',
    };
  }

  // 3. Super Admin: List all academies
  @Get()
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('academies:manage')
  @ApiOperation({ summary: 'Super-Admin: List all registered academies' })
  async findAll() {
    const data = await this.academyService.findAll();
    return {
      success: true,
      data,
      message: 'All academies fetched successfully.',
    };
  }

  // 4. Super Admin: Fetch specific academy details
  @Get(':id')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('academies:manage')
  @ApiOperation({ summary: 'Super-Admin: Retrieve specific academy details' })
  @ApiParam({ name: 'id', description: 'Academy institution UUID' })
  async findOne(@Param('id') id: string) {
    const data = await this.academyService.findOne(id);
    return {
      success: true,
      data,
      message: 'Academy details retrieved successfully.',
    };
  }

  // 5. Super Admin: Provision new academy
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('academies:manage')
  @ApiOperation({ summary: 'Super-Admin: Provision a new academy instance' })
  async create(@Body() dto: CreateAcademyDto) {
    const data = await this.academyService.create(dto);
    return {
      success: true,
      data,
      message: 'Academy instance provisioned successfully.',
    };
  }

  // 6. Super Admin: Update status
  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('academies:manage')
  @ApiOperation({ summary: 'Super-Admin: Update academy operational status (active/inactive)' })
  @ApiParam({ name: 'id', description: 'Academy institution UUID' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateAcademyStatusDto) {
    const data = await this.academyService.updateStatus(id, dto);
    return {
      success: true,
      data,
      message: 'Academy status modified successfully.',
    };
  }

  // 7. Super Admin: Assign subscription
  @Post(':id/subscriptions')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('subscriptions:manage')
  @ApiOperation({ summary: 'Super-Admin: Update billing plan for academy' })
  @ApiParam({ name: 'id', description: 'Academy institution UUID' })
  async addSubscription(@Param('id') id: string, @Body() dto: CreateSubscriptionDto) {
    const data = await this.academyService.addSubscription(id, dto);
    return {
      success: true,
      data,
      message: 'Billing subscription applied successfully.',
    };
  }

  // 8. Super Admin: Remove academy
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RbacGuard)
  @RequirePermissions('academies:manage')
  @ApiOperation({ summary: 'Super-Admin: De-provision an academy instance' })
  @ApiParam({ name: 'id', description: 'Academy institution UUID' })
  async remove(@Param('id') id: string) {
    const data = await this.academyService.remove(id);
    return {
      success: true,
      data,
      message: 'Academy instance removed successfully.',
    };
  }
}
