import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FollowRequest } from './follow-request.entity';
import { Follow } from 'src/follows/follows.entity';
import { User } from 'src/users/users.entity';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class FollowRequestService {
  constructor(
    @InjectRepository(FollowRequest)
    private followRequestRepo: Repository<FollowRequest>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Follow)
    private followsRepo: Repository<Follow>,
    private readonly notificationsService: NotificationsService,
  ) {}

 async sendRequest(fromUserId:string,toUserId:string){
  if(fromUserId===toUserId){
    throw new ConflictException(`You can't send request to yourself`);
  }

  const fromUser=await this.usersRepo.findOne({where:{id:fromUserId}});
  const toUser = await this.usersRepo.findOne({ where: { id: toUserId } });

  if(!fromUser||!toUser) throw new NotFoundException('User not found');

  const existingFollow = await this.followsRepo.findOne({
    where: { follower: { id: fromUserId }, following: { id: toUserId } },
  });
  if (existingFollow) {
    throw new ConflictException('Already following this user');
  }

  const existingRequest = await this.followRequestRepo.findOne({
    where: { fromUser: { id: fromUserId }, toUser: { id: toUserId }, status: 'PENDING' },
  });
  if (existingRequest) {
    throw new ConflictException('Follow request already sent');
  }

  const request = this.followRequestRepo.create({
    fromUser,
    toUser,
    status:'PENDING',
  });
  await this.followRequestRepo.save(request);

  await this.notificationsService.createNotification(
    toUser,
    'FOLLOW_REQUEST',
    fromUser,
    undefined,
    request,
  );

  return { message: 'Follow request sent', request };
 }

 async sendRequestByUsername(fromUserId: string, toUsername: string) {
  const toUser = await this.usersRepo.findOne({ where: { username: toUsername } });
  if (!toUser) throw new NotFoundException('User not found');

  return this.sendRequest(fromUserId, toUser.id);
}

 async getSentRequestsWithStatus(userId:string){
  return this.followRequestRepo.find({
    where:{fromUser:{id:userId}},
    relations:['fromUser','toUser'],
    order: { createdAt: 'DESC' },
  })
 }

  
  async getUserRequests(userId: string) {
    return this.followRequestRepo.find({
      where: { toUser: { id: userId } },
      relations: ['fromUser', 'toUser'],
    });
  }


  async acceptRequest(requestId: string) {
    const request = await this.followRequestRepo.findOne({
      where: { id: requestId },
      relations: ['fromUser', 'toUser'],
    });
    if (!request) throw new NotFoundException('Follow request not found');
    request.status = 'ACCEPTED';
    await this.followRequestRepo.save(request);

    const follow = this.followsRepo.create({
      follower: request.fromUser,
      following: request.toUser,
    });
    await this.followsRepo.save(follow);
    await this.notificationsService.createNotification(
      request.fromUser,
      'FOLLOW',
      request.toUser,
    );
  
 
    return follow;
  }

  
  async rejectRequest(requestId: string) {
    const request = await this.followRequestRepo.findOne({ where: { id: requestId } });
    if (!request) throw new NotFoundException('Request not found');

    request.status = 'REJECTED';
    await this.followRequestRepo.save(request);

  
    return { message: 'Follow request rejected' };
  }

  async cancelRequestByUsername(fromUserId: string, toUsername: string) {
    const toUser = await this.usersRepo.findOne({ where: { username: toUsername } });
    if (!toUser) throw new NotFoundException('User not found');

    const request = await this.followRequestRepo.findOne({
      where: { 
        fromUser: { id: fromUserId }, 
        toUser: { id: toUser.id }, 
        status: 'PENDING' 
      },
      relations: ['fromUser', 'toUser'],
    });
    
    if (!request) throw new NotFoundException('No pending request found');


    await this.followRequestRepo.remove(request);



    return { message: 'Follow request cancelled' };
  }
}
