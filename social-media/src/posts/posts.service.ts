import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from './posts.entity';
import { Like, Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { validate as isUuid } from 'uuid';

@Injectable()
export class PostsService {

 constructor(@InjectRepository(Post) private postsRepo:Repository<Post> ){}

 async create(createPostDto:CreatePostDto,userId:string){
  const post=this.postsRepo.create({...createPostDto,userId});
  return await this.postsRepo.save(post);
 }

 async findOne(id: string) {

  if (!isUuid(id)) {
    throw new NotFoundException(`Post with ID ${id} not found`);
  }
  const post = await this.postsRepo.findOne({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    return post;
}

async findByUsername(username: string, currentUserId: string) {
  const posts = await this.postsRepo.find({
    where: { user: { username } },
    relations: ['user', 'likes', 'likes.user'], 
    order: { createdAt: 'DESC' },
  });

  return posts.map(post => ({
    id: post.id,
    title: post.title,
    content: post.content,
    createdAt: post.createdAt,
    //imageUrl: post.imageUrl,
    likesCount: post.likes.length,
    isLiked: post.likes.some(like => like.user.id === currentUserId), 
    user: {
      id: post.user.id,
      username: post.user.username,
    },
  }));
}


async searchPosts(query: string) {
  if (!query) return [];
  return this.postsRepo.find({
    where: [
      { title: Like(`%${query}%`) },
      { content: Like(`%${query}%`) },
    ],
    order: { createdAt: 'DESC' },
  });
}


async update(id: string, dto: UpdatePostDto, userId: string) {
  const post = await this.findOne(id);
  if (!post) throw new NotFoundException('Post not found');
  if (post.userId !== userId) {
    throw new ForbiddenException('You are not allowed to edit this post');
  }
  Object.assign(post, dto);
  return this.postsRepo.save(post);
}

async remove(id: string, userId: string) {
  const post = await this.findOne(id);
  if (!post) throw new NotFoundException('Post not found');
  if (post.userId !== userId) {
    throw new ForbiddenException('You are not allowed to delete this post');
  }
  await this.postsRepo.remove(post);
  return {message:'Post deleted successfully'};
}

}
