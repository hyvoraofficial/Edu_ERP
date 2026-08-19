import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: ['TEACHER'], description: 'List of role codes to assign to the user' })
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  roleCodes: string[];
}
