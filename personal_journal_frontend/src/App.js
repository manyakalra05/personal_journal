// src/App.js - Complete Enhanced Version
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import CreatePost from './components/CreatePost';
import EditPost from './components/EditPost';
import PostList from './components/PostList';
import PostDetail from './components/PostDetail';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

function PageWrapper({ children }) {
  const location = useLocation();
  return (
    <div key={location.pathname} className="page-content">
      {children}
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const darkModePref = localStorage.getItem('darkMode');
    if (darkModePref === 'true') {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }

    setTimeout(() => setLoading(false), 300);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <h2>📔 PersonalJournal</h2>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
        <Toaster position="top-right" />
        <Navbar 
          user={user} 
          onLogout={handleLogout} 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
        <div className="container mt-4">
          <PageWrapper>
            <Routes>
              <Route
                path="/login"
                element={user ? <Navigate to="/dashboard" /> : <Login onLogin={handleLogin} />}
              />
              <Route
                path="/register"
                element={user ? <Navigate to="/dashboard" /> : <Register />}
              />
              <Route
                path="/dashboard"
                element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
              />
              <Route
                path="/create"
                element={user ? <CreatePost user={user} /> : <Navigate to="/login" />}
              />
              <Route
                path="/edit/:id"
                element={user ? <EditPost user={user} /> : <Navigate to="/login" />}
              />
              <Route
                path="/posts"
                element={<PostList user={user} />}
              />
              <Route
                path="/post/:id"
                element={<PostDetail user={user} />}
              />
              <Route
                path="/"
                element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />}
              />
            </Routes>
          </PageWrapper>
        </div>
      </div>
    </Router>
  );
}

export default App;