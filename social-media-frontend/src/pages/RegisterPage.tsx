import React, { useState } from 'react'
import { useNavigate } from 'react-router';
import { fetchAPI } from '../api/api';
import '../css/RegisterPage.css';
import { Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react'; 

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetchAPI('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      localStorage.setItem('username', username);
      navigate('/login');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Register</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input 
            type='text' 
            placeholder="Username" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
          />

          <div className="password-wrapper">
            <input 
              type={showPassword ? 'text' : 'password'} 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
            <span 
              className="password-toggle-icon" 
              onClick={() => setShowPassword(prev => !prev)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </div>

          <button type="submit">Register</button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to='/login'>Login</Link>
        </p>
      </div>
    </div>
  )
}

export default RegisterPage;
