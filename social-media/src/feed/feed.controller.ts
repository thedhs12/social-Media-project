import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { FeedService } from './feed.service';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  async getFeed(
    @GetUser() user: any,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('mode') mode: 'all' | 'following' = 'all',
    @Req() req: any,
  ) {

    const feedMode:'all'|'following'=mode==='following'?'following':'all';
    return this.feedService.getUserFeed(
      user.id,
      Number(page),
      Number(limit),
      feedMode,
    );
  }
}
