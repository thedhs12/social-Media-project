
import { FollowRequest } from 'src/follow-request/follow-request.entity';
import { Follow } from 'src/follows/follows.entity';
import { Like } from 'src/likes/likes.entity';
import { Notification } from 'src/notifications/notifications.entity';
import { Post } from 'src/posts/posts.entity';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User{
  @PrimaryGeneratedColumn('uuid')
  id:string;

  @Column({unique:true})
  username:string;

  @Column()
  password:string;

  @Column({type:'text',nullable:true})
  bio?:string | null;

  @Column({default:false})
  isPrivate:boolean;


  @CreateDateColumn()
  createdAt:Date;

  @OneToMany(()=>Post,(p)=>p.user)
  posts:Post[];

  @OneToMany(()=>Like,(l)=>l.user)
  likes:Like[];

  @OneToMany(()=>Follow,(follow)=>follow.follower)
  following:Follow[];

  @OneToMany(()=>Follow,(follow)=>follow.following)
  followers:Follow[];

  @OneToMany(()=>Notification,(notification)=>notification.recipient)
  notifications:Notification[];

  @OneToMany(() => FollowRequest, (request) => request.toUser)
followRequests: FollowRequest[];

}

