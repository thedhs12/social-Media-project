import { Controller, Delete, Param, Post, UseGuards } from '@nestjs/common';
import { LikesService } from './likes.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('posts/:id')
export class LikesController {

  constructor(private readonly likeService:LikesService){}

  @Post('like')

  likePost(@Param('id') postId:string,@GetUser() user:any){
    return this.likeService.likePost(postId,user.id);
  }

  @Delete('unlike')
  unlikePost(@Param('id') postId:string,@GetUser() user:any){
    return this.likeService.unlikePost(postId,user.id);
  }

}