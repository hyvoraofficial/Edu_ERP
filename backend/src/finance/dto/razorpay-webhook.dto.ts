import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsObject } from 'class-validator';

export class RazorpayWebhookDto {
  @ApiProperty({ example: 'payment.captured', description: 'Razorpay webhook event code' })
  @IsString()
  @IsNotEmpty()
  event: string;

  @ApiProperty({ example: {}, description: 'Razorpay event webhook payload object' })
  @IsObject()
  @IsNotEmpty()
  payload: Record<string, any>;
}
