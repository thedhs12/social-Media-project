import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './likes.entity';
import { Post } from 'src/posts/posts.entity';
import { User } from 'src/users/users.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private likesRepo: Repository<Like>,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private readonly notificationService: NotificationsService,
  ) {}

  async likePost(postId: string, userId: string) {
    const post = await this.postsRepo.findOne({
      where: { id: postId },
      relations: ['likes','likes.user','user'],
    });
    if (!post) throw new NotFoundException('Post not found');



    if (post.likes.some(l => l.user.id === userId)) {
      throw new ConflictException('You already liked this post');
    }

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const like = this.likesRepo.create({ post, user });
    await this.likesRepo.save(like);


     if (post.user.id !== user.id) {
      await this.notificationService.createNotification(post.user, 'LIKE', user, post);
    }

    return like;
  }

  async unlikePost(postId: string, userId: string) {
    const like = await this.likesRepo.findOne({
      where: { post: { id: postId }, user: { id: userId } },
    });
    if (!like) throw new NotFoundException('Like not found');

    await this.likesRepo.remove(like);
    return { message: 'Post unliked successfully' };
  }
}
