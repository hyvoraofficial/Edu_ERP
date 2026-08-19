import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'reset-token-uuid-sent-to-mail', description: 'Reset verification token sent via mailbox' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({ example: 'newsecurepassword123', description: 'New password credentials to write to account' })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long.' })
  @IsNotEmpty()
  newPassword: string;
}
