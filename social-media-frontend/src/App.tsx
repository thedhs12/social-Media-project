import React, { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import './App.css'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import Navbar from './components/Navbar'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const [mode, setMode] = useState<'all' | 'following'>('all');
  useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <>

      <BrowserRouter>
        <Navbar mode={mode} setMode={setMode} />
        <Routes>
        <Route path="/" element={isAuthenticated ? <FeedPage mode={mode} /> : <Navigate to="/login" />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/login"
            element={<LoginPage onLogin={() => setIsAuthenticated(true)} />}
          />
          <Route path='/register' element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
