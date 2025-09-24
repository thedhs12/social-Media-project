import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from './comments.entity';
import { Post } from 'src/posts/posts.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { User } from 'src/users/users.entity';
import { Notification } from 'src/notifications/notifications.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  imports:[TypeOrmModule.forFeature([Comment,Post,User,Notification])],
  providers: [CommentsService,NotificationsService],
  controllers: [CommentsController]
})
export class CommentsModule {}
