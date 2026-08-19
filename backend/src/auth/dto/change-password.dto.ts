import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPassword123!', description: 'Current password for identity confirmation' })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({ example: 'NewSuperPassword789!', description: 'New password value' })
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'New password must be at least 8 characters long.' })
  newPassword: string;

  @ApiProperty({ example: 'NewSuperPassword789!', description: 'Confirm new password value' })
  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}
