import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAPI } from '../api/api';
import CommentSection from '../components/CommentSection';
import { FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';

interface Post {
  id: string;
  title: string;
  content: string;
  author?: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isLiked: boolean;
}

const PostPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openComments, setOpenComments] = useState(false);

  const token = localStorage.getItem('token');

  const loadPost = async () => {
    setLoading(true);
    try {
      const data = await fetchAPI<Post>(`/posts/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setPost(data); 
      setError('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const toggleLike = async () => {
    if (!post) return;
    const liked = post.isLiked;
  
    setPost(prev => prev
      ? { ...prev, isLiked: !liked, likesCount: liked ? prev.likesCount - 1 : prev.likesCount + 1 }
      : prev
    );
  
    try {
      if (liked) {
        await fetchAPI(`/posts/${post.id}/unlike`, { method: 'DELETE' });
      } else {
        await fetchAPI(`/posts/${post.id}/like`, { method: 'POST' });
      }
    } catch (err: any) {
      console.error(err);
      await loadPost();
    }
  };
  
  const handleCommentCountChange = (count: number) => {
    setPost(prev => prev ? { ...prev, commentsCount: count } : prev);
  };

  const handleToggleComments = () => setOpenComments(prev => !prev);

  useEffect(() => {
    loadPost();
  }, [id]);

  if (loading) return <p style={{ textAlign: 'center' }}>Loading post...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;
  if (!post) return <p style={{ textAlign: 'center' }}>Post not found</p>;

  return (
    <div className="post-page-container">
      <div className="post-card">
        <div className="post-header">
          <img
            src={post.author?.avatarUrl || '/avtar.png'}
            alt={post.author?.username || 'Unknown'}
            className="post-avatar"
          />
          <strong>@{post.author?.username || 'Unknown'}</strong>
        </div>

        <div className="post-content">
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </div>

        
        <div className="post-footer">
          <button className="like-button" onClick={toggleLike}>
            {post.isLiked ? <FaHeart className="heart liked" /> : <FaRegHeart className="heart" />}
          </button>
          <span>{post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}</span>

          <div className="comment-icon-container" onClick={handleToggleComments}>
            <FaComment className="comment-icon-btn" />
            <span className="comment-count">{post.commentsCount}</span>
          </div>
        </div>

        
        {openComments && (
          <CommentSection
            postId={post.id}
            visible={openComments}
            onCountChange={handleCommentCountChange}
          />
        )}

        <span className="post-date">
          {new Date(post.createdAt).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
    </div>
  );
};

export default PostPage;
