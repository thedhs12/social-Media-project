import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { fetchAPI } from '../api/api';
import '../css/ProfilePage.css';
import CreatePost from '../components/CreatePost';
import PostCard from '../components/PostCard';
import '../css/CommentSection.css'

interface UserProfile {
  username: string;
  bio?: string;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing?: boolean;
  isPrivate?: boolean;
  avatarUrl?: string;
  hasRequestPending?: boolean;
}

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  imageUrl?: string;
  user: { username: string; avatarUrl?: string };
  likesCount: number;
  isLiked: boolean;
  commentsCount: number;
}

const ProfilePage: React.FC = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bio, setBio] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);

  const currentUser = localStorage.getItem('username') || '';

  const loadProfile = async () => {
    try {
      const userData = username
        ? await fetchAPI<UserProfile>(`/users/${username}/details`)
        : await fetchAPI<UserProfile>(`/users/me`);
      setProfile(userData);
      setBio(userData.bio || '');
      setIsPrivate(userData.isPrivate || false);

      const userPosts = await fetchAPI<Post[]>(
        `/posts/user/${username || userData.username}?currentUser=${currentUser}`
      );
      const postsWithComments = await Promise.all(
      userPosts.map(async(p) => {
        const comments = await fetchAPI<{ id: string; content: string }[]>(`/posts/${p.id}/comments`);
        return { ...p, commentsCount: comments.length };
      }));

      setPosts(postsWithComments);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  const handleFollow = async () => {
    if (!profile) return;
    try {
      if (profile.isFollowing) {
        await fetchAPI(`/users/${profile.username}/unfollow`, { method: 'DELETE' });
        setError('Unfollowed successfully');
      } else if (profile.hasRequestPending) {
        await fetchAPI(`/follow-requests/cancel/${profile.username}`, { method: 'DELETE' });
        setError('Follow request cancelled');
      } else {
        const response = await fetchAPI<{ message: string }>(`/users/${profile.username}/follow`, { method: 'POST' });
        if (response.message === 'Follow request sent') {
          setError('Follow request sent successfully');
        } else {
          setError('Now following this user');
        }
      }
      loadProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveProfile = async () => {
    try {
      await fetchAPI(`/users/profile`, { method: 'PUT', body: JSON.stringify({ bio }) });
      setIsEditingProfile(false);
      loadProfile();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!profile) return <p>Loading...</p>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <img className="avatar" src={profile.avatarUrl || '/avtar.png'} alt={profile.username} />
        <div className="profile-info">
          <div className="username-row">
          <h2>@{profile.username}</h2>
          {!username && (
  <button
    className="privacy-toggle-btn"
    onClick={async () => {
      try {
        const newPrivacy = !isPrivate;
        await fetchAPI(`/users/profile/privacy`, {
          method: 'PUT',
          body: JSON.stringify({ isPrivate: newPrivacy }),
        });
        setIsPrivate(newPrivacy);
      } catch (err: any) {
        alert(err.message);
      }
    }}
  >
    {isPrivate ? 'Make Profile Public' : 'Make Profile Private'}
  </button>
)}

           
            {!username && <button onClick={() => setIsEditingProfile(true)}>Edit Profile</button>}
            {username && username !== 'me' && (
              <button 
                className={
                  profile.isFollowing 
                    ? 'unfollow-btn' 
                    : profile.hasRequestPending 
                      ? 'requested-btn' 
                      : 'follow-btn'
                }
                onClick={handleFollow}
              >
                {profile.isFollowing 
                  ? 'Unfollow' 
                  : profile.hasRequestPending 
                    ? 'Requested' 
                    : 'Follow'}
              </button>
            )}
          </div>

          {isEditingProfile ? (
            <div className="bio-edit">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
              <button onClick={handleSaveProfile}>Save</button>
              <button onClick={() => setIsEditingProfile(false)}>Cancel</button>
            </div>
          ) : (
            <p className="bio">{profile.bio || 'No bio yet.'}</p>
          )}

          <div className="stats">
            <div className="stat">
              <span className="stat-number">{posts.length}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">{profile.followersCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{profile.followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>

      {!username && (
        <>
          <div className="floating-add-btn" onClick={() => setShowCreateModal(true)}>+</div>
          {showCreateModal && (
            <CreatePost onPostCreated={loadProfile} onClose={() => setShowCreateModal(false)} />
          )}
        </>
      )}

<div className="posts-grid">
  {profile.isPrivate && username && !profile.isFollowing ? (
    <p>This account is private. Follow to see posts.</p>
  ) : posts.length === 0 ? (
    <p>No posts yet.</p>
  ) : (
    posts.map((post) => (
      <PostCard
        key={post.id}
        post={post}
        currentUser={currentUser}
        onUpdate={loadProfile}
      />
    ))
  )}
</div>
    </div>
  );
};

export default ProfilePage;
