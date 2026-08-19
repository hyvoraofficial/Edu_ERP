import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ example: 'refresh-token-uuid-or-string', description: 'Active JSON Web Token refresh string' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
