import { Body, Controller, Get, Param, Put, Query, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';

@Controller('users')
export class UsersController {

 constructor(private readonly usersService:UsersService){}


 @UseGuards(JwtAuthGuard)
 @Get('search')
 searchUsers(@Query('user') query:string){
  return this.usersService.searchUsers(query);
 }
 @UseGuards(JwtAuthGuard)
 @Get('me')
 async getMe(@GetUser()user:any){
   return this.usersService.findById(user.id);
 }


 @UseGuards(JwtAuthGuard)
 @Get(':username')
 getUser(@Param('username') username:string){
  return this.usersService.findByUsername(username);
 }


 @UseGuards(JwtAuthGuard)
 @Put('profile')
 async updateProfile(@GetUser() user: any, @Body() dto: UpdateProfileDto) {
   return this.usersService.updateProfile(user.id, dto);
 }

}
