
export interface User {
  id: string;
  username: string;
  avatarUrl?: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {id:string;username:string};      
  likesCount?: number; 
  isLiked?: boolean;   
  imageUrl?: string;
}
