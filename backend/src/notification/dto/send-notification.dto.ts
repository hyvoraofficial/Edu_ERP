import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsString, IsEnum } from 'class-validator';
import { NotificationType } from './create-template.dto';

export class SendNotificationDto {
  @ApiProperty({ example: 'u1111111-1111-1111-1111-111111111111', description: 'Recipient User UUID' })
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ example: 'Fee Payment Alert', description: 'Subject or brief title' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Your tuition fee of term-1 is due in 3 days.', description: 'Notification message body' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ example: 'in_app', enum: NotificationType })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;
}
