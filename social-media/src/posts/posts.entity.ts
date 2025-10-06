import { Comment } from "src/comments/comments.entity";
import { Like } from "src/likes/likes.entity";
import { User } from "src/users/users.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('posts')
export class Post{
  @PrimaryGeneratedColumn('uuid')
  id:string;

  @Column({length:255})
  title:string;

  @Column('text')
  content:string;

  @ManyToOne(()=>User,(user)=>user.posts,{onDelete:'CASCADE'})
  user:User;

  @OneToMany(()=>Like,(like)=>like.post,{cascade:true})
  likes:Like[];

  @OneToMany(() => Comment, (comment) => comment.post,{cascade:true}) 
  comments: Comment[];


  @Column()
  userId:string;

  @CreateDateColumn()
  createdAt:Date;

  @UpdateDateColumn()
  updatedAt:Date;
}