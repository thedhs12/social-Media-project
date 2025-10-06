import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { fetchAPI } from '../api/api';
import '../css/Search.css';

interface User {
  id: string;
  username: string;
}

const SearchPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('query') || '';
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) return;

    const search = async () => {
      try {
        const usersData = await fetchAPI<User[]>(`/users/search?user=${query}`);
        setUsers(usersData);
        setError('');
      } catch (err: any) {
        setError(err.message || 'No users found');
        setUsers([]);
      }
    };

    search();
  }, [query]);

  return (
    <div className="search-page">
      <h2>Search Results for "{query}"</h2>
      {error && <p className="error">{error}</p>}

      {users.length > 0 ? (
        <div className="search-users">
          {users.map((user) => (
            <Link
              key={user.id}
              to={`/profile/${user.username}`}
              className="search-user-card"
            >
              <img
                src={'/default-profile.png'}
                alt={user.username}
                className="search-avatar"
              />
              <div className="search-user-info">
                <strong>@{user.username}</strong>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p>No users found.</p>
      )}
    </div>
  );
};

export default SearchPage;
