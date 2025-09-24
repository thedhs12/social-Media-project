import { Controller,Post as HttpPost,Get,Put,Delete,Param,Body,UseGuards, Query} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('posts')
export class PostsController {

 constructor(private readonly postsService:PostsService){}

 @Get('search')
  searchPosts(@Query('post') query: string) {
    return this.postsService.searchPosts(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/:username')
  async getPostsByUser(@Param('username') username: string,@GetUser() user:any) {
    return this.postsService.findByUsername(username,user.id);
  }

 @UseGuards(JwtAuthGuard)
@HttpPost()
  create(@Body() dto: CreatePostDto, @GetUser() user: any) {
    return this.postsService.create(dto, user.id);
  }

 @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
  

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
    @GetUser() user: any,
  ) {
    return this.postsService.update(id, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: any) {
    return this.postsService.remove(id, user.id);
  }

}
