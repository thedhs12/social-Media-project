import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './likes.entity';
import { Post } from 'src/posts/posts.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { User } from 'src/users/users.entity';

@Module({
  imports:[TypeOrmModule.forFeature([Like,Post,User]),NotificationsModule],
  providers: [LikesService],
  controllers: [LikesController],
  exports:[LikesService],
})
export class LikesModule {}
