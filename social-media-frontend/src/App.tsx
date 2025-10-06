import React, { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router'
import './App.css'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import Navbar from './components/Navbar'
import FeedPage from './pages/FeedPage'
import ProfilePage from './pages/ProfilePage'
import SearchPage from './pages/SearchPage'
import UserProfile from './components/UserProfile'
import PostPage from './pages/PostPage'


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
        <Route path="/profile/:username" element={<UserProfile />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/posts/:id" element={<PostPage />} />  
          <Route
            path="/login"
            element={<LoginPage onLogin={() => {setIsAuthenticated(true); 
                                              setMode("all")}} />}
          />
          <Route path='/register' element={<RegisterPage />} />
          <Route path="/search" element={<SearchPage />} />
        
       
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
