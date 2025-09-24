import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Notification } from './notifications.entity';
import { User } from 'src/users/users.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Notification,User])],
  providers: [NotificationsService],
  controllers: [NotificationsController],
  exports:[NotificationsService],
})
export class NotificationsModule {}
