import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class UpdateRolePermissionsDto {
  @ApiProperty({ example: ['students:create', 'students:read'], description: 'List of permission codes to assign to the role' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  permissionCodes: string[];
}
