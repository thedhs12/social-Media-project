import { Link, useNavigate } from 'react-router-dom';
import "../css/Navbar.css";
import { useState } from 'react';
import { FiChevronUp } from 'react-icons/fi';  

interface NavbarProps {
  mode: 'all' | 'following';
  setMode: (mode: 'all' | 'following') => void;
}

const Navbar: React.FC<NavbarProps> = ({ mode, setMode }) => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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

  return (
    <nav className='navbar'>
      <div
        className='navbar-logo'
        id="social-media"
        onClick={toggleDropdown}
        style={{ cursor: 'pointer', userSelect: 'none', display: 'inline-flex', alignItems: 'center' }}
      >
        Social Media
        {dropdownOpen && (
          <span style={{ marginLeft: 4 }}>
            <FiChevronUp />
          </span>
        )}
      </div>

      {dropdownOpen && token && (
        <div className="dropdown-menu">
          <div onClick={() => handleModeChange('all')}>All Posts</div>
          <div onClick={() => handleModeChange('following')}>Following Only</div>
        </div>
      )}

      <div className="navbar-links">
        {token && <Link to="/profile">Profile</Link>}
        {!token && <Link to="/login">Login</Link>}
        {!token && <Link to="/register">Register</Link>}
        {token && <button onClick={logout}>Logout</button>}
      </div>
    </nav>
  );
}

export default Navbar;
