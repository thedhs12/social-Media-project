import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchAPI } from '../api/api';
import PostCard from './PostCard';
import CreatePost from './CreatePost';
import '../css/UserProfile.css';
import '../css/CommentSection.css';

interface UserProfileData {
  id: string;
  username: string;
  bio?: string;
  avatarUrl?: string;
  followers?: Array<{ id: string; username: string }>;
  following?: Array<{ id: string; username: string }>;
  isFollowing?: boolean; 
  followersCount?: number;
  followingCount?: number;
}

export interface UserPost {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
  user: { username: string; avatarUrl?: string; id?: string };
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
}

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const currentUser = localStorage.getItem('username') || '';


  const loadProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = username
        ? await fetchAPI<UserProfileData>(`/users/${username}/details`)
        : await fetchAPI<UserProfileData>(`/users/me`);

      
      setProfile({
        ...data,
        followersCount: data.followersCount ?? 0,
        followingCount: data.followingCount ?? 0,
        isFollowing: data.isFollowing ?? false,
      });
      setError(null);
    } catch (err: any) {
      console.error('Failed to load profile', err);
      setError(err.message || 'Failed to load profile');
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  // const handlePostLike = (postId: string, liked: boolean) => {
  //   setPosts((prev) =>
  //     prev.map((p) =>
  //       p.id === postId
  //         ? {
  //           ...p,
  //           isLiked: liked,
  //           likesCount: liked ? p.likesCount + 1 : p.likesCount - 1,
  //         }
  //         : p
  //     )
  //   );
  // };

  const loadPosts = async () => {
    setLoadingPosts(true);
    try {
      if (!profile) {
        setPosts([]);
        return;
      }

      const raw = await fetchAPI<UserPost[]>(
        `/posts/user/${profile.username}?currentUser=${currentUser}`
      );

      const needCommentsFetch = raw.some((p) => p.commentsCount === undefined || p.commentsCount === null);

      if (!needCommentsFetch) {
        setPosts(raw);
      } else {
        const enriched = await Promise.all(
          raw.map(async (p) => {
            try {
              const comments = await fetchAPI<{ id: string }[]>(`/posts/${p.id}/comments`);
              return { ...p, commentsCount: Array.isArray(comments) ? comments.length : 0 };
            } catch (e) {
              console.error('Failed to fetch comments for post', p.id, e);
              return { ...p, commentsCount: 0 };
            }
          })
        );
        setPosts(enriched);
      }

      setError(null);
    } catch (err: any) {
      console.error('Failed to load posts', err);
      setError(err.message || 'Failed to load posts');
      setPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (profile) loadPosts();
  }, [profile]);

  const onPostCreated = async () => {
    await loadPosts();
  };

  const handleEditProfile = () => {
    navigate('/profile');
  };

  const viewingOwnProfile = !username || username === currentUser;

  if (loadingProfile) return <div className="up-center">Loading profile...</div>;
  if (error) return <div className="up-error">{error}</div>;
  if (!profile) return <div className="up-center">Profile not found.</div>;

  return (
    <div className="profile-page container">
      <div className="profile-header card">
        <div className="profile-left">
          <img className="profile-avatar" src={profile.avatarUrl || '/avtar.png'} alt={profile.username} />
        </div>
        <div className="profile-main">
          <div className="profile-top-row">
            <h1 className="profile-username">@{profile.username}</h1>
            {viewingOwnProfile ? (
              <button className="btn small" onClick={handleEditProfile}>Edit Profile</button>
            ) : (
              <FollowButton
                viewedUsername={profile.username}
                initialFollowing={profile.isFollowing}
                onFollowChange={(newFollowing, newCount) => {
                  setProfile((prev) => prev
                    ? { ...prev, isFollowing: newFollowing, followersCount: newCount }
                    : prev
                  );
                }}
              />
            )}
          </div>
          <p className="profile-bio">{profile.bio || 'No bio yet.'}</p>

          <div className="profile-stats">
            <div className="stat">
              <span className="num">{(posts?.length ?? 0).toLocaleString()}</span>
              <span className="label">Posts</span>
            </div>
            <div className="stat">
              <span className="num">{(profile?.followersCount ?? 0).toLocaleString()}</span>
              <span className="label">Followers</span>
            </div>
            <div className="stat">
              <span className="num">{(profile?.followingCount ?? 0).toLocaleString()}</span>
              <span className="label">Following</span>
            </div>
          </div>
        </div>
      </div>

      {viewingOwnProfile && (
        <>
          <div className="floating-add-btn" onClick={() => setShowCreateModal(true)}>+</div>
          {showCreateModal && (
            <CreatePost onPostCreated={onPostCreated} onClose={() => setShowCreateModal(false)} />
          )}
        </>
      )}

      <div className="posts-grid">
        {loadingPosts ? (
          <div className="up-center">Loading posts...</div>
        ) : posts.length === 0 ? (
          <div className="up-center">No posts yet.</div>
        ) : (
          posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              currentUser={currentUser}
              onUpdate={loadPosts}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UserProfile;

const FollowButton: React.FC<{
  viewedUsername: string;
  initialFollowing?: boolean;
  onFollowChange?: (following: boolean, newFollowersCount: number) => void;
}> = ({ viewedUsername, initialFollowing = false, onFollowChange }) => {
  const [isFollowing, setIsFollowing] = React.useState(initialFollowing);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  const toggleFollow = async () => {
    setLoading(true);
    try {
      let newCount = 0;

      if (isFollowing) {
        const res = await fetchAPI<{ followersCount: number }>(
          `/users/${viewedUsername}/unfollow`,
          { method: 'DELETE' }
        );
        setIsFollowing(false);
        newCount = res.followersCount;
        onFollowChange && onFollowChange(false, newCount);
      } else {
        const res = await fetchAPI<{ followersCount: number }>(
          `/users/${viewedUsername}/follow`,
          { method: 'POST' }
        );
        setIsFollowing(true);
        newCount = res.followersCount;
        onFollowChange && onFollowChange(true, newCount);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      alert('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button" 
      className={`btn small ${isFollowing ? 'following' : 'outline'}`}
      disabled={loading}
      onClick={toggleFollow}
    >
      {isFollowing ? 'Following' : 'Follow'}
    </button>
  );
};
