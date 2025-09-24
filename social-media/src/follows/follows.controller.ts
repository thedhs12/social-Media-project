import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { User } from 'src/users/users.entity';

@UseGuards(JwtAuthGuard)
@Controller('users/:username')
export class FollowsController {
  constructor(private readonly followsService:FollowsService){}

  @Post('follow')
  follow(@Param('username') username:string,@GetUser() user:any){
    return this.followsService.followUser(user.id,username);
  }

  @Get('is-following')
isFollowing(@Param('username') username: string, @GetUser() user: User) {
  return this.followsService.isFollowing(user.id, username);
}

  @Delete('unfollow')
  unfollow(@Param('username') username:string,@GetUser() user:any){
    return this.followsService.unfollowUser(user.id,username);
  }
}
