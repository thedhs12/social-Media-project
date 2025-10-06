import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'src/users/users.entity';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationService:NotificationsService){}

  @Get()
  async getNotifications(
    @GetUser() user:User,
    @Query('page') page='1',
    @Query('limit') limit='20',
){
  const result = await this.notificationService.getUserNotification(user.id,Number(limit),Number(page));
  
 
  const transformedNotifications = result.notifications.map(notification => ({
    ...notification,
    followRequestId: notification.followRequest?.id || null,
  }));

  return {
    ...result,
    notifications: transformedNotifications,
  };
}

@Patch(':id/read')
markAsRead(@Param('id') id:string){
  return this.notificationService.markAsRead(id);
}

}
