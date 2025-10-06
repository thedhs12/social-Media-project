import { Post } from "src/posts/posts.entity";
import { User } from "src/users/users.entity";
import { FollowRequest } from "src/follow-request/follow-request.entity";
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.notifications, { eager: true })
  recipient: User;

  @Column({ type: 'enum', enum: ['LIKE', 'COMMENT', 'FOLLOW','FOLLOW_REQUEST'] })
  type: 'LIKE' | 'COMMENT' | 'FOLLOW'| 'FOLLOW_REQUEST';

  @ManyToOne(() => Post, { nullable: true, eager: true, onDelete: 'CASCADE' })
  post?: Post;

  @ManyToOne(() => User, { nullable: true, eager: true })
  fromUser?: User;

  @ManyToOne(() => FollowRequest, { nullable: true, eager: true, onDelete: 'CASCADE' })
  followRequest?: FollowRequest;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
