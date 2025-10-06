import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from './notifications.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/users.entity';
import { Post } from 'src/posts/posts.entity';
import { FollowRequest } from 'src/follow-request/follow-request.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectRepository(Notification) private notificationRepo: Repository<Notification>) {}

  async createNotification(
    recipient: User,
    type: 'LIKE' | 'COMMENT' | 'FOLLOW'| 'FOLLOW_REQUEST',
    fromUser: User,
    post?: Post,
    followRequest?: FollowRequest,
  ) {
    if (!recipient || !fromUser) throw new Error('Recipient and fromUser must be full User entities');

    const notification = this.notificationRepo.create({
      recipient,
      type,
      fromUser,
      post,
      followRequest,
    });
    return this.notificationRepo.save(notification);
  }

  async getUserNotification(userId: string, limit = 20, page = 1) {
    const [notifications, total] = await this.notificationRepo.findAndCount({
      where: { recipient: { id: userId } },
      relations: ['recipient', 'fromUser', 'post', 'followRequest'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: (page - 1) * limit,
    });
    
    return {
      notifications,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async markAsRead(notificationId: string) {
    await this.notificationRepo.update(notificationId, { isRead: true });
    return { message: 'Notification marked as read' };
  }
}
