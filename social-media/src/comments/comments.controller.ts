import { Controller, UseGuards ,Post,Delete,Body, Param, Get} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';


@UseGuards(JwtAuthGuard)
@Controller()
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Post('posts/:id/comments')
  createComment(@Param('id') postId: string, @GetUser() user: any, @Body() dto: CreateCommentDto) {
    return this.commentsService.create(postId, user.id, dto);
  }

  @Get('posts/:id/comments')
  getComments(@Param('id') postId:string){
    return this.commentsService.getCommentsForPost(postId);
  }

  @Delete('comments/:id')
  deleteComment(@Param('id') commentId: string, @GetUser() user: any) {
    return this.commentsService.remove(commentId, user.id);
  }
}
