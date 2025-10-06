import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users.entity';
import { Follow } from 'src/follows/follows.entity';
import { FollowRequest } from 'src/follow-request/follow-request.entity';

@Module({
  imports:[TypeOrmModule.forFeature([User,Follow,FollowRequest])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService,TypeOrmModule],
})
export class UsersModule {}
