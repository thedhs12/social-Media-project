import { Controller, Delete, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { FollowRequestService } from './follow-request.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('follow-requests')
export class FollowRequestController {
  constructor(private readonly followRequestService: FollowRequestService) {}

  @Get()
  getRequests(@Req() req) {
    return this.followRequestService.getUserRequests(req.user.id);
  }
  @Get('sent')
  getSentRequests(@Req() req) {
    return this.followRequestService.getSentRequestsWithStatus(req.user.id);
  }

  @Post('send/:toUsername')
  sendRequest(@Req() req, @Param('toUsername') toUsername: string) {
    return this.followRequestService.sendRequestByUsername(req.user.id, toUsername);
  }

  // @Post('send/:toUserId')
  // sendRequest(@Req() req,@Param('toUserId') toUserId:string){
  //   return this.followRequestService.sendRequest(req.user.id,toUserId);
  // }


  @Post(':id/accept')
  acceptRequest(@Param('id') id: string) {
    return this.followRequestService.acceptRequest(id);
  }

  @Post(':id/reject')
  rejectRequest(@Param('id') id: string) {
    return this.followRequestService.rejectRequest(id);
  }

  
  @Delete('cancel/:toUsername')
  cancelRequest(@Req() req, @Param('toUsername') toUsername: string) {
    return this.followRequestService.cancelRequestByUsername(req.user.id, toUsername);
  }
}
