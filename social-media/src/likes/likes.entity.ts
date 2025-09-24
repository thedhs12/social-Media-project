import { Post } from "src/posts/posts.entity";
import { User } from "src/users/users.entity";
import { CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity('likes')
@Unique(['user','post'])
export class Like{

  @PrimaryGeneratedColumn('uuid')
  id:string;

  @ManyToOne(()=>User,(user)=>user.likes,{onDelete:'CASCADE'})
  user:User;

  @ManyToOne(()=>Post,(post)=>post.likes,{onDelete:'CASCADE'})
  post:Post;

   @CreateDateColumn()
   createdAt:Date;


}