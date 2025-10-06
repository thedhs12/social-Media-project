import { Injectable, NotFoundException } from '@nestjs/common';
import { ILike, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Follow } from 'src/follows/follows.entity';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { FollowRequest } from 'src/follow-request/follow-request.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>,
  @InjectRepository(Follow) private followsRepo:Repository<Follow>,
  @InjectRepository(FollowRequest) private followRequestRepo: Repository<FollowRequest>) {}

  async findByUsername(username: string) {
    const user = await this.usersRepo.findOne({
      where: { username },
      select: ['id', 'username', 'bio', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
  

  async findById(id: string) {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations:['followers','following'],
      select: ['id', 'username', 'bio', 'createdAt'],
    });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      createdAt: user.createdAt,
      followersCount: user.followers?.length ?? 0,
      followingCount: user.following?.length ?? 0,
    };
  
  }

  async getUserProfile(username: string, currentUserId: string) {
    const user = await this.usersRepo.findOne({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    
    const followersCount = await this.followsRepo.count({ where: { following: { id: user.id } } });
    const followingCount = await this.followsRepo.count({ where: { follower: { id: user.id } } });

    
    const isFollowing = await this.followsRepo.findOne({
      where: {
        follower: { id: currentUserId },
        following: { id: user.id },
      },
    });

    
    const followRequest = await this.followRequestRepo.findOne({
      where: {
        fromUser: { id: currentUserId },
        toUser: { id: user.id },
        status: 'PENDING',
      },
    });

    return {
      id: user.id,
      username: user.username,
      bio: user.bio,
      followersCount,
      followingCount,
      isFollowing: !!isFollowing,
      isPrivate: user.isPrivate,
      hasRequestPending: !!followRequest,
    };
  }

 
  async searchUsers(query: string) {
    if (!query) return [];

    const users = await this.usersRepo.find({
      where: { username: ILike(`%${query}%`) },
    });

    if (!users.length) throw new NotFoundException('User not found');
    return users;
  }
 

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    
    if (dto.bio !== undefined) user.bio = dto.bio;

    await this.usersRepo.save(user);
    const { password, ...rest } = user as any;
    return rest;
  }
  async updatePrivacy(userId: string, dto: UpdatePrivacyDto) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    user.isPrivate = dto.isPrivate;
    await this.usersRepo.save(user);
    return { message: 'Profile privacy updated', isPrivate: user.isPrivate };
  }
}
