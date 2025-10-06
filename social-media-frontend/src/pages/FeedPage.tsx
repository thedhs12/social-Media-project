import React, { useEffect, useState } from 'react';
import { fetchAPI } from '../api/api';
import { FaComment, FaHeart, FaRegHeart } from 'react-icons/fa';
import '../css/FeedPage.css';
import CommentSection from '../components/CommentSection';

interface Post {
  id: number;
  title: string;
  content: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  likesCount: number;
  commentsCount: number;
  createdAt: string;
  isLiked: boolean;
}

interface FollowRequest {
  id: string;
  fromUser: { username: string };
  toUser: { username: string };
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
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
  const [followRequests, setFollowRequests] = useState<{ [username: string]: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null }>({});
  const [openComments, setOpenComments] = useState<{ [postId: number]: boolean }>({});

  const loggedInUserUsername = localStorage.getItem('username');
  const token = localStorage.getItem('token');

  const loadFeed = async (pageNum = 1) => {
    setLoading(true);
    try {
      const data = await fetchAPI<{ posts: Post[]; totalPages: number; page: number }>(`/feed?page=${pageNum}&limit=10&mode=${mode}`);
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
        `/users/${authorUsername}/is-following`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFollowStatus(prev => ({ ...prev, [authorUsername]: userFollowStatus.isFollowing }));
    } catch (err) {
      console.error(err);
    }
  };

  const loadSentRequests = async () => {
    try {
      const data = await fetchAPI<FollowRequest[]>('/follow-requests/sent', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const reqMap: { [username: string]: 'PENDING' | 'ACCEPTED' | 'REJECTED' | null } = {};
      data.forEach(req => {
        if (req.status === 'PENDING') {
          reqMap[req.toUser.username] = req.status;
        }
      });
      setFollowRequests(reqMap);
    } catch (err) {
      console.error(err);
    }
  };

  // const sendFollowRequest = async (username: string) => {
  //   setFollowRequests(prev => ({ ...prev, [username]: 'PENDING' }));
  
  //   try {
  //     const res = await fetchAPI<{ message: string }>(`/follow-requests/send/${username}`, {
  //       method: 'POST',
  //       headers: { Authorization: `Bearer ${token}` },
  //     });
  //     console.log(res.message);
  //   } catch (err: any) {
  //     setFollowRequests(prev => ({ ...prev, [username]: null }));
  //     alert(err.message || 'Failed to send follow request');
  //   }
  // };

 

  
  const unfollowUser = async (username: string) => {
    setFollowStatus(prev => ({ ...prev, [username]: false }));
  
    try {
      await fetchAPI(`/users/${username}/unfollow`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Unfollowed successfully');
    } catch (err: any) {
      setFollowStatus(prev => ({ ...prev, [username]: true }));
      alert(err.message || 'Failed to unfollow');
    }
  };

  const cancelFollowRequest = async (username: string) => {
    setFollowRequests(prev => ({ ...prev, [username]: null }));
  
    try {
      await fetchAPI(`/follow-requests/cancel/${username}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Follow request cancelled');
    } catch (err: any) {
      setFollowRequests(prev => ({ ...prev, [username]: 'PENDING' }));
      alert(err.message || 'Failed to cancel request');
    }
  };
  

  const toggleLike = async (postId: number, liked: boolean) => {
    try {
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId
            ? { ...post, isLiked: !liked, likesCount: liked ? post.likesCount - 1 : post.likesCount + 1 }
            : post
        )
      );
      if (liked) await fetchAPI(`/posts/${postId}/unlike`, { method: 'DELETE' });
      else await fetchAPI(`/posts/${postId}/like`, { method: 'POST' });
    } catch (err) {
      console.error(err);
      loadFeed(page);
    }
  };

  const handleCommentCountChange = (postId: number, count: number) => {
    setPosts(prev => prev.map(p => (p.id === postId ? { ...p, commentsCount: count } : p)));
  };

  const handleToggleComments = (postId: number) => {
    setOpenComments(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  const handleLoadMore = async () => {
    if (page < totalPages && !loading) await loadFeed(page + 1);
  };
  const handleFollowClick = async (username: string) => {
    try {
      const user = await fetchAPI<{ isPrivate: boolean }>(`/users/${username}`);
  
      if (user.isPrivate) {
       
        if (followRequests[username] !== 'PENDING') {
          await fetchAPI(`/follow-requests/send/${username}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
          setFollowRequests(prev => ({ ...prev, [username]: 'PENDING' }));
          setFollowStatus(prev => ({ ...prev, [username]: false })); // make sure it's not showing 'Following'
        }
      } else {
       
        if (followStatus[username]) {
          await fetchAPI(`/users/${username}/unfollow`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
          setFollowStatus(prev => ({ ...prev, [username]: false }));
        } else {
          await fetchAPI(`/users/${username}/follow`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } });
          setFollowStatus(prev => ({ ...prev, [username]: true }));
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to follow/unfollow');
    }
  };
  useEffect(() => {
    loadFeed(1);
    loadSentRequests();
  }, [mode]);

  useEffect(() => {
    posts.forEach(post => loadFollowStatus(post.author.username));
  }, [posts]);

  if (loading && page === 1) return <p style={{ textAlign: 'center' }}>Loading Feed...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div className="feed-container">
      {posts.length === 0 ? (
        <p style={{ textAlign: 'center' }}>No posts yet. Follow someone to see posts!</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="post-card">
            <div className="post-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <img src={post.author.avatarUrl || '/avtar.png'} alt={post.author.username} className="post-avatar" />
                <strong>@{post.author.username}</strong>
              </div>

{post.author.username !== loggedInUserUsername && (
  <button
  className="follow-btn"
  onClick={() => {
    const isFollowing = followStatus[post.author.username];
    const requestStatus = followRequests[post.author.username];

    if (isFollowing) {
      unfollowUser(post.author.username);
    } else if (requestStatus === 'PENDING') {
      cancelFollowRequest(post.author.username);
    } else {
      // sendFollowRequest(post.author.username);
      handleFollowClick(post.author.username);
      // reload();
    }
  }}
>
  {followStatus[post.author.username]
    ? 'Following'
    : followRequests[post.author.username] === 'PENDING'
    ? 'Requested'
    : 'Follow'}
</button>
)}

            </div>

            <div className="post-content">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </div>

            
            <div className="post-footer">
              <button className="like-button" onClick={() => toggleLike(post.id, post.isLiked)}>
                {post.isLiked ? <FaHeart className="heart liked" /> : <FaRegHeart className="heart" />}
              </button>
              <span>{post.likesCount} Likes</span>
              <div className="comment-icon-container" onClick={() => handleToggleComments(post.id)}>
                <FaComment className="comment-icon-btn" />
                <span className="comment-count">{post.commentsCount}</span>
              </div>
            </div>

            <CommentSection
              postId={post.id}
              visible={!!openComments[post.id]}
              onCountChange={count => handleCommentCountChange(post.id, count)}
            />

            <span className="post-date">
              {new Date(post.createdAt).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))
      )}

      {page < totalPages && (
        <div style={{ textAlign: 'center', margin: '20px' }}>
          <button className="load-more-btn" onClick={handleLoadMore} disabled={loading}>
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
