import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Physics Teacher', description: 'Friendly name of the role' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'PHYSICS_TEACHER', description: 'Unique alphanumeric identifier code' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({ example: 'Role assigned specifically to physics department teachers', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: ['students:read', 'attendance:create'], description: 'Initial permissions codes to map to this role', required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  permissionCodes?: string[];
}
