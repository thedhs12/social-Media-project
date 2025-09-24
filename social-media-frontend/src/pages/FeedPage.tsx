import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../api/api';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import '../css/FeedPage.css';
import '../css/Follow.css';

interface Post {
  id: number;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  likesCount: number;
  createdAt: string;
  updatedAt: string;
  isLiked: boolean;
}

interface FeedPageProps {
  mode: 'all' | 'following';
}

const FeedPage: React.FC<FeedPageProps> = ({ mode }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [followStatus, setFollowStatus] = useState<{ [username: string]: boolean }>({});

  const loadFeed = async (pageNum = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must login first');
        setLoading(false);
        return;
      }

      const data = await fetchAPI<{
        posts: Post[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(`/feed?page=${pageNum}&limit=10&mode=${mode}`);

      setPosts(prev => (pageNum === 1 ? data.posts : [...prev, ...data.posts]));
      setPage(data.page);
      setTotalPages(data.totalPages);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Failed to load feed');
    } finally {
      setLoading(false);
    }
  };

 
  const loadFollowStatus = async (authorUsername: string) => {
    try {
      const userFollowStatus = await fetchAPI<{ isFollowing: boolean }>(
        `/users/${authorUsername}/is-following`
      );
      setFollowStatus((prev) => ({
        ...prev,
        [authorUsername]: userFollowStatus.isFollowing,
      }));
    } catch (err: any) {
      console.error('Failed to load follow status', err);
    }
  };


  const toggleFollow = async (username: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
       
        await fetchAPI(`/users/${username}/unfollow`, { method: 'DELETE' });
      } else {
        
        await fetchAPI(`/users/${username}/follow`, { method: 'POST' });
      }
     
      setFollowStatus((prevStatus) => ({
        ...prevStatus,
        [username]: !isFollowing,
      }));
    } catch (err: any) {
      console.error('Failed to follow/unfollow', err);
    }
  };


  const toggleLike = async (postId: number, liked: boolean) => {
    try {
    
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? {
                ...post,
                isLiked: !liked,
                likesCount: liked ? post.likesCount - 1 : post.likesCount + 1,
              }
            : post
        )
      );

      if (liked) {
        
        await fetchAPI(`/posts/${postId}/unlike`, { method: 'DELETE' });
      } else {
        
        await fetchAPI(`/posts/${postId}/like`, { method: 'POST' });
      }
    } catch (err) {
      console.error('Failed to like/unlike post', err);
      loadFeed(page); 
    }
  };

  const handleLoadMore = async () => {
    if (page < totalPages && !loading) {
      await loadFeed(page + 1);
    }
  };

  useEffect(() => {
    loadFeed(1);
  }, [mode]);

  
  useEffect(() => {
    posts.forEach(post => {
      loadFollowStatus(post.author.username);
    });
  }, [posts]);

  if (loading && page === 1) return <p style={{ textAlign: 'center' }}>Loading Feed...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;


  const loggedInUserUsername = localStorage.getItem('username');

  return (
    <div className="feed-container">
      {posts.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No posts yet. Follow someone to see posts!</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <strong>@{post.author.username}</strong>

      
              {post.author.username !== loggedInUserUsername && (
                <button
                  className="follow-btn"
                  onClick={() => toggleFollow(post.author.username, followStatus[post.author.username])}
                >
                  {followStatus[post.author.username] ? 'Following' : 'Follow'}
                </button>
              )}
            </div>

            <div className="post-content">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </div>
            
            <div className="post-footer">
              <button
                className="like-button"
                onClick={() => toggleLike(post.id, post.isLiked)}
                aria-label={post.isLiked ? 'Unlike post' : 'Like post'}
              >
                {post.isLiked ? (
                  <FaHeart className="heart liked" />
                ) : (
                  <FaRegHeart className="heart" />
                )}
              </button>
              <span>
                {post.likesCount} Likes • {new Date(post.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))
      )}

      {page < totalPages && (
        <div style={{ textAlign: 'center', margin: '20px' }}>
          <button onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
