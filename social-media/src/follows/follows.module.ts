import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from './follows.entity';
import { User } from 'src/users/users.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { FollowRequestModule } from 'src/follow-request/follow-request.module';


@Module({
  imports:[TypeOrmModule.forFeature([Follow,User]),NotificationsModule,FollowRequestModule],
  providers: [FollowsService],
  controllers: [FollowsController]
})
export class FollowsModule {}
