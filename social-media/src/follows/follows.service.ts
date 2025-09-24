import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Follow } from './follows.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/users.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class FollowsService {
  constructor(
    @InjectRepository(Follow) private followsRepo: Repository<Follow>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private readonly notificationService: NotificationsService,
  ) {}

  async followUser(followerId: string, username: string) {
    const following = await this.usersRepo.findOne({ where: { username } });
    if (!following) throw new NotFoundException('User not found');


    const follower = await this.usersRepo.findOne({ where: { id: followerId } });
    if (!follower) throw new NotFoundException('Follower user not found');

    if (follower.id === following.id) {
      throw new ConflictException(`You can't follow yourself`);
    }

 
    const existing = await this.followsRepo.findOne({
      where: { follower: { id: followerId }, following: { id: following.id } },
      relations: ['follower', 'following'],
    });
    if (existing) throw new ConflictException('Already following this user');

    const follow = this.followsRepo.create({
      follower,   
      following,
    });
    await this.followsRepo.save(follow);

  
    await this.notificationService.createNotification(
      following, 
      'FOLLOW',
      follower,  
    );

    return follow;
  }

  async isFollowing(followerId: string, username: string) {
    const following = await this.usersRepo.findOne({ where: { username } });
    if (!following) throw new NotFoundException('User not found');
  
    const existing = await this.followsRepo.findOne({
      where: {
        follower: { id: followerId },
        following: { id: following.id },
      },
    });
  
    return { isFollowing: !!existing };
  }

  async unfollowUser(followerId: string, username: string) {
    const following = await this.usersRepo.findOne({ where: { username } });
    if (!following) throw new NotFoundException('User not found');

    const follower = await this.usersRepo.findOne({ where: { id: followerId } });
    if (!follower) throw new NotFoundException('Follower user not found');

    const follow = await this.followsRepo.findOne({
      where: { follower: { id: followerId }, following: { id: following.id } },
      relations: ['follower', 'following'],
    });
    if (!follow) throw new NotFoundException('Not following this user');

    await this.followsRepo.remove(follow);
    return { message: 'Unfollowed successfully' };
  }
}
