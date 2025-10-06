import { Link, useNavigate, useLocation } from 'react-router-dom';
import "../css/Navbar.css";
import "../css/notifications.css";
import { useEffect, useState } from 'react';
import { FiBell, FiChevronUp, FiSearch } from 'react-icons/fi';
import { fetchAPI } from '../api/api';

interface NavbarProps {
  mode: 'all' | 'following';
  setMode: (mode: 'all' | 'following') => void;
}

interface NotificationType {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'FOLLOW_REQUEST';
  fromUser?: { username: string };
  post?: { id: string; title?: string };
  isRead: boolean;
  createdAt: string;
  followRequestId?: string;
  requestStatus?: 'ACCEPTED' | 'REJECTED';
}

const Navbar: React.FC<NavbarProps> = ({ mode, setMode }) => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);

 
  const loadNotifications = async () => {
    try {
      const data = await fetchAPI<{ notifications: NotificationType[] }>('/notifications');
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

 
  const acceptFollowRequest = async (followRequestId: string, notificationId: string) => {
    try {
      await fetchAPI(`/follow-requests/${followRequestId}/accept`, {
        method: 'POST',
      });
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, isRead: true, requestStatus: 'ACCEPTED' }
          : n
      ));
      
      await markAsRead(notificationId);
    } catch (err) {
      console.error(err);
      loadNotifications(); 
    }
  };

  const rejectFollowRequest = async (followRequestId: string, notificationId: string) => {
    try {
      await fetchAPI(`/follow-requests/${followRequestId}/reject`, {
        method: 'POST',
      });
      
      setNotifications(prev => prev.map(n => 
        n.id === notificationId 
          ? { ...n, isRead: true, requestStatus: 'REJECTED' }
          : n
      ));
      
      await markAsRead(notificationId);
    } catch (err) {
      console.error(err);
      loadNotifications(); 
    }
  };

  const handleNotificationClick = async (notif: NotificationType) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
    }

    if (notif.type === 'FOLLOW' && notif.fromUser) {
      navigate(`/profile/${notif.fromUser.username}`);
    } else if ((notif.type === 'LIKE' || notif.type === 'COMMENT') && notif.post) {
      navigate(`/posts/${notif.post.id}`);
    }

    setNotifOpen(false);
  };

  const markAsRead = async (id: string) => {
    try {
      await fetchAPI(`/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

 
  const logout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleModeChange = (newMode: 'all' | 'following') => {
    setMode(newMode);
    navigate('/');
    setDropdownOpen(false);
  };

 
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }
    try {
      const users = await fetchAPI<any[]>(`/users/search?user=${query}`);
      setUsers(users);
      setShowDropdown(true);
    } catch (error) {
      console.error("User search failed", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery('');
    setShowDropdown(false);
  }, [location.pathname]);

  useEffect(() => {
    if (token) loadNotifications();
  }, [token]);

 
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notif-modal') && !target.closest('.notif-wrapper')) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [notifOpen]);

  return (
    <nav className="navbar">
      <div
        className="navbar-logo"
        onClick={toggleDropdown}
        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
      >
        Social Media {dropdownOpen && <FiChevronUp style={{ marginLeft: 4 }} />}
      </div>

      {dropdownOpen && token && (
        <div className="dropdown-menu">
          <div onClick={() => handleModeChange('all')}>All Posts</div>
          <div onClick={() => handleModeChange('following')}>Following Only</div>
        </div>
      )}

      {token && (
        <form className="search-form" onSubmit={(e) => { e.preventDefault(); }}>
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              autoComplete="off"
            />
          </div>

          {showDropdown && users.length > 0 && (
            <div className="search-dropdown">
              <div className="search-section">
                <strong>Users</strong>
                {users.map(user => (
                  <div
                    key={user.id}
                    className="search-item"
                    onClick={() => { navigate(`/profile/${user.username}`); setSearchQuery(''); setShowDropdown(false); }}
                  >
                    <img src={'/default-profile.png'} alt={user.username} />
                    @{user.username}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      )}

      <div className="navbar-links">
        {token && (
          <div className="notif-wrapper" style={{ position: 'relative', cursor: 'pointer', marginRight: '15px' }}>
            <FiBell onClick={() => setNotifOpen(!notifOpen)} />
            {notifications.filter(n => !n.isRead).length > 0 && (
              <span className="notif-badge">{notifications.filter(n => !n.isRead).length}</span>
            )}

{notifOpen && (
  <div className="notif-modal">
    <div className="modal-content">
      <h4>Notifications</h4>
      <div className="notif-list-wrapper">
      {notifications.length === 0 ? (
        <div className="notif-item">No notifications</div>
      ) : (
        notifications.map(n => (
          <div key={n.id} className={`notif-item ${n.isRead ? '' : 'unread'}`}>
            {n.type === 'FOLLOW_REQUEST' && n.fromUser && n.followRequestId ? (
              <div className="follow-request-notif">
                <span>@{n.fromUser.username} wants to follow you</span>
                {n.requestStatus === 'ACCEPTED' ? (
                  <div className="request-status accepted">Request Accepted</div>
                ) : n.requestStatus === 'REJECTED' ? (
                  <div className="request-status rejected">Request Rejected</div>
                ) : (
                  <div className="follow-request-buttons">
                    <button 
                      className="accept-btn"
                      onClick={() => acceptFollowRequest(n.followRequestId!, n.id)}
                    >
                      Accept
                    </button>
                    <button 
                      className="reject-btn"
                      onClick={() => rejectFollowRequest(n.followRequestId!, n.id)}
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div onClick={() => handleNotificationClick(n)}>
                {n.fromUser?.username || 'Someone'} {
                  n.type === 'FOLLOW' ? 'started following you' :
                  n.type === 'LIKE' ? `liked your post "${n.post?.title}"` :
                  n.type === 'COMMENT' ? `commented on your post "${n.post?.title}"` :
                  n.type.toLowerCase()
                }
              </div>
            )}
          </div>
        ))
      )}
      </div>
      <button className="modal-close-btn" onClick={() => setNotifOpen(false)}>Close</button>
    </div>
  </div>
)}
          </div>
        )}

        {token && <Link to="/profile">Profile</Link>}
        {!token && <Link to="/login">Login</Link>}
        {!token && <Link to="/register">Register</Link>}
        {token && <button onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
};

export default Navbar;
