import { Post } from "../posts/posts.entity";
import { User } from "../users/users.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('comments')
export class Comment{
  @PrimaryGeneratedColumn('uuid')
  id:string;

  @Column('text')
  content:string;

  @ManyToOne(()=>User,(user)=>user.id,{eager:true})
  user: User;

  @ManyToOne(() => Post, (post) => post.id, { eager: true ,onDelete:'CASCADE'})
  post: Post;

  @CreateDateColumn()
  createdAt: Date;
}