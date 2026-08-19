import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: 'verification-token-from-welcome-email', description: 'Verification string token to assert email' })
  @IsString()
  @IsNotEmpty()
  token: string;
}
