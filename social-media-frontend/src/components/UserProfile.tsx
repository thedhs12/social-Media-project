import React from 'react';
import { fetchAPI } from '../api/api';

interface UserProfileProps {
  profile: {
    username: string;
    isFollowing: boolean;  
  };
  loadProfile: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ profile, loadProfile }) => {
  const { username, isFollowing } = profile;

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await fetchAPI(`/users/${username}/unfollow`, { method: 'DELETE' });
      } else {
        await fetchAPI(`/users/${username}/follow`, { method: 'POST' });
      }
      loadProfile();  
    } catch (err: any) {
      console.error(err);
      alert('Error occurred while following/unfollowing');
    }
  };

  return (
    <div className="user-profile">
      <h2>@{username}</h2>
      <button onClick={handleFollow}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    </div>
  );
};

export default UserProfile;
