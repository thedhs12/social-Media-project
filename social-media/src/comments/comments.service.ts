import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './comments.entity';
import { Repository } from 'typeorm';
import { Post } from 'src/posts/posts.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import { User } from 'src/users/users.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment) private commentsRepo: Repository<Comment>,
    @InjectRepository(Post) private postsRepo: Repository<Post>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private readonly notificationService: NotificationsService,
  ) {}

  async create(postId: string, userId: string, dto: CreateCommentDto) {
    const post = await this.postsRepo.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    if (!post) throw new NotFoundException('Post not found');

    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const comment = this.commentsRepo.create({
      content: dto.content,
      user,
      post, 
    });

    await this.commentsRepo.save(comment);

    if (post.user.id !== userId) {
      await this.notificationService.createNotification(
        post.user,
        'COMMENT',
        user,
        post,
      );
    }

    return comment;
  }

  async remove(commentId: string, userId: string) {
    const comment = await this.commentsRepo.findOne({
      where: { id: commentId },
      relations: ['user'],
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.user.id !== userId)
      throw new ForbiddenException('Not allowed to delete this comment');

    await this.commentsRepo.remove(comment);
    return { message: 'Comment deleted successfully' };
  }
}
