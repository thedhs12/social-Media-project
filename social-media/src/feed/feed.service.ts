
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from 'src/comments/comments.entity';
import { Follow } from 'src/follows/follows.entity';
import { Post } from 'src/posts/posts.entity';
import { Repository, In } from 'typeorm';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectRepository(Follow) private followsRepo: Repository<Follow>,
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
  ) {}

  async getUserFeed(userId: string, page = 1, limit = 10, mode: 'all' | 'following' = 'all') {
    const relations = ['user', 'likes', 'likes.user'];
    let posts: Post[] = [];
    let total = 0;

    if (mode === 'all') {
      [posts, total] = await this.postsRepo.findAndCount({
        relations,
        order: { createdAt: 'DESC' },
        take: limit,
        skip: (page - 1) * limit,
      });
    } else {
      const follows = await this.followsRepo.find({
        where: { follower: { id: userId } },
        relations: ['following'],
      });
      const followingIds = follows.map((f) => f.following.id);

      if (!followingIds.length) {
        return {
          posts: [],
          total: 0,
          page,
          limit,
          totalPages: 0,
        };
      }

      [posts, total] = await this.postsRepo.findAndCount({
        relations,
        where: { user: { id: In(followingIds) } },
        order: { createdAt: 'DESC' },
        take: limit,
        skip: (page - 1) * limit,
      });
    }

    const mapped = await Promise.all(posts.map(async post => ({
      id: post.id,
      title: post.title,
      content: post.content,
      author: {
        id: post.user?.id ?? null,
        username: post.user?.username ?? 'unknown',
      },
      likesCount: post.likes?.length ?? 0,
      isLiked: post.likes?.some((l) => l.user?.id === userId) ?? false,
      commentsCount: await this.commentsRepo.count({ where: { post: { id: post.id } } }),
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    })));

    return {
      posts: mapped,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
