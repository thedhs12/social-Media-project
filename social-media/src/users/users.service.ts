import { Injectable, NotFoundException } from '@nestjs/common';
import { ILike, Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

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
}
