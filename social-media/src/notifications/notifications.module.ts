import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notifications.entity';
import { User } from 'src/users/users.entity';
import { FollowRequest } from 'src/follow-request/follow-request.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Notification,User,FollowRequest])],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports:[NotificationsService],
})
export class NotificationsModule {}
