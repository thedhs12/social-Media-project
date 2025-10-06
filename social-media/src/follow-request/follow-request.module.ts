import { Module } from '@nestjs/common';
import { FollowRequestService } from './follow-request.service';
import { FollowRequestController } from './follow-request.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/users.entity';
import { Follow } from 'src/follows/follows.entity';
import { FollowRequest } from './follow-request.entity';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Notification } from 'src/notifications/notifications.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FollowRequest, User, Follow,Notification])],
  providers: [FollowRequestService,NotificationsService],
  controllers: [FollowRequestController],
  exports: [FollowRequestService,TypeOrmModule],
})
export class FollowRequestModule {}
