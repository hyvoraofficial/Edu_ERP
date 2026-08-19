import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { RoleController } from './role.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController, RoleController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
