import { User } from "../users/users.entity";
import { Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('follows')
@Unique(['follower','following'])
export class Follow {
  @PrimaryGeneratedColumn('uuid')
  id: string;  

  @ManyToOne(() => User, (user) => user.following, { onDelete: 'CASCADE' })
  follower: User;

  @ManyToOne(() => User, (user) => user.followers, { onDelete: 'CASCADE' })
  following: User;
}
