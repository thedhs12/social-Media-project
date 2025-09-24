import { Module } from '@nestjs/common';
import { FeedService } from './feed.service';
import { FeedController } from './feed.controller';
import { Follow } from 'src/follows/follows.entity';
import { Post } from 'src/posts/posts.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Follow])],
  providers: [FeedService],
  controllers: [FeedController]
})
export class FeedModule {}
