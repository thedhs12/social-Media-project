import { User } from 'src/users/users.entity';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('follow_requests')
export class FollowRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  
  @ManyToOne(() => User, (user) => user.followRequests, { onDelete: 'CASCADE' })
  fromUser: User;


  @ManyToOne(() => User, (user) => user.followRequests, { onDelete: 'CASCADE' })
  toUser: User;

  @Column({ type: 'enum', enum: ['PENDING', 'ACCEPTED', 'REJECTED'], default: 'PENDING' })
status: 'PENDING' | 'ACCEPTED' | 'REJECTED';

  @CreateDateColumn()
  createdAt: Date;
}
