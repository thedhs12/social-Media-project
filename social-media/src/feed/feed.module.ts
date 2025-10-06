import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { Follow } from 'src/follows/follows.entity';
import { Post } from 'src/posts/posts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from 'src/comments/comments.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Follow,Comment])],
  providers: [FeedService],
  controllers: [FeedController]
})
export class FeedModule {}
