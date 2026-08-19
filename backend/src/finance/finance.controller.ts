import { 
  Controller, Get, Post, Delete, Body, Param, Req, Query, UseGuards, Headers, HttpCode, HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, ApiOperation, ApiHeader, ApiParam, ApiQuery, ApiBearerAuth 
} from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateFeeStructureDto } from './dto/create-fee-structure.dto';
import { CreateFeeAllocationDto } from './dto/create-fee-allocation.dto';
import { InitializeTransactionDto } from './dto/initialize-transaction.dto';
import { RecordPaymentDto } from './dto/record-payment.dto';
import { RazorpayWebhookDto } from './dto/razorpay-webhook.dto';
import { TenantGuard } from '../common/guards/tenant.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RbacGuard } from '../common/guards/rbac.guard';
import { RequirePermissions } from '../common/decorators/permissions.decorator';

@ApiTags('Financial & Payments Ledger')
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  // ==========================================
  // FEE STRUCTURE ENDPOINTS
  // ==========================================

  @Post('structures')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('fees:manage')
  @ApiOperation({ summary: 'Create a new fee structure tuition charge (Admin only)' })
  async createStructure(@Req() req: any, @Body() dto: CreateFeeStructureDto) {
    const data = await this.financeService.createStructure(req.tenant.id, dto);
    return {
      success: true,
      data,
      message: 'Fee structure created successfully.',
    };
  }

  @Get('structures')
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('fees:manage')
  @ApiOperation({ summary: 'List all fee structures' })
  async findAllStructures(@Req() req: any) {
    const data = await this.financeService.findAllStructures(req.tenant.id);
    return {
      success: true,
      data,
      message: 'Fee structures list retrieved successfully.',
    };
  }

  @Delete('structures/:id')
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('fees:manage')
  @ApiOperation({ summary: 'Delete fee structure tuition charge' })
  @ApiParam({ name: 'id', description: 'Fee Structure UUID' })
  async removeStructure(@Req() req: any, @Param('id') id: string) {
    const data = await this.financeService.removeStructure(req.tenant.id, id);
    return {
      success: true,
      data,
      message: 'Fee structure deactivated successfully.',
    };
  }

  // ==========================================
  // FEE ALLOCATION ENDPOINTS
  // ==========================================

  @Post('allocations')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('fees:manage')
  @ApiOperation({ summary: 'Allocate a fee structure charge to student' })
  async createAllocation(@Req() req: any, @Body() dto: CreateFeeAllocationDto) {
    const data = await this.financeService.createAllocation(req.tenant.id, dto);
    return {
      success: true,
      data,
      message: 'Fee structure allocated to student successfully.',
    };
  }

  @Get('allocations')
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('payments:read')
  @ApiOperation({ summary: 'List fee allocations matching student filter' })
  @ApiQuery({ name: 'studentId', required: false, description: 'Student UUID' })
  async findAllAllocations(@Req() req: any, @Query('studentId') studentId?: string) {
    const data = await this.financeService.findAllAllocations(req.tenant.id, studentId);
    return {
      success: true,
      data,
      message: 'Allocations list retrieved successfully.',
    };
  }

  @Get('allocations/:id')
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('payments:read')
  @ApiOperation({ summary: 'Get details of specific fee allocation profile' })
  @ApiParam({ name: 'id', description: 'Fee Allocation UUID' })
  async findOneAllocation(@Req() req: any, @Param('id') id: string) {
    const data = await this.financeService.findOneAllocation(req.tenant.id, id);
    return {
      success: true,
      data,
      message: 'Allocation details fetched successfully.',
    };
  }

  // ==========================================
  // TRANSACTION & WEBHOOK ENDPOINTS
  // ==========================================

  @Post('payments/initialize')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('payments:create')
  @ApiOperation({ summary: 'Initialize online payment gateway transaction session' })
  async initializeTransaction(@Req() req: any, @Body() dto: InitializeTransactionDto) {
    const data = await this.financeService.initializeTransaction(req.tenant.id, dto);
    return {
      success: true,
      data,
      message: 'Payment gateway transaction order generated successfully.',
    };
  }

  // Public webhook endpoint hit directly by Razorpay servers
  @Post('payments/razorpay-webhook')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard)
  @ApiOperation({ summary: 'Public endpoint processing Razorpay capture events webhooks' })
  async handleRazorpayWebhook(
    @Req() req: any,
    @Headers('x-razorpay-signature') signature: string,
    @Body() rawBody: any
  ) {
    // Signature parsing is forwarded to verify service
    const data = await this.financeService.verifyWebhook(
      req.tenant.id,
      signature || 'test-signature-bypass',
      rawBody,
      rawBody as RazorpayWebhookDto
    );
    return {
      success: true,
      data,
      message: 'Webhook processed successfully.',
    };
  }

  @Post('payments/offline')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('payments:create')
  @ApiOperation({ summary: 'Record offline fee payments cheque/cash (Admin only)' })
  async recordOfflinePayment(@Req() req: any, @Body() dto: RecordPaymentDto) {
    const data = await this.financeService.recordOfflinePayment(req.tenant.id, req.user.id, dto);
    return {
      success: true,
      data,
      message: 'Offline payment recorded and receipt mapped successfully.',
    };
  }

  @Get('receipts/:id')
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('payments:read')
  @ApiOperation({ summary: 'Retrieve unique PDF receipt metadata' })
  @ApiParam({ name: 'id', description: 'Payment realized UUID' })
  async getReceipt(@Req() req: any, @Param('id') id: string) {
    const data = await this.financeService.getReceipt(req.tenant.id, id);
    return {
      success: true,
      data,
      message: 'Receipt details retrieved successfully.',
    };
  }

  @Get('history/:studentId')
  @ApiBearerAuth()
  @ApiHeader({ name: 'X-Academy-Subdomain', required: true })
  @UseGuards(TenantGuard, JwtAuthGuard, RbacGuard)
  @RequirePermissions('payments:read')
  @ApiOperation({ summary: 'List payment history logs for specific student' })
  @ApiParam({ name: 'studentId', description: 'Student UUID' })
  async getPaymentHistory(@Req() req: any, @Param('studentId') studentId: string) {
    const data = await this.financeService.getPaymentHistory(req.tenant.id, studentId);
    return {
      success: true,
      data,
      message: 'Student payment history retrieved successfully.',
    };
  }
}
