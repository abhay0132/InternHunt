// src/components/Header.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../utils/authService';
import { tokenManager } from '../utils/tokenManager';
import '../styles/Header.css';

const Header = () => {
  const navigate = useNavigate();
  const isAuthenticated = tokenManager.isAuthenticated();
  const user = tokenManager.getUser();

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">
            <span className="logo-symbol">IH</span>
            <span className="logo-text">InternHunt</span>
          </Link>
          
          {isAuthenticated && (
            <nav className="nav-links">
              <Link to="/internships">internships</Link>
              <Link to="/applied">applied</Link>
              <Link to="/bookmarks">bookmarks</Link>
            </nav>
          )}
        </div>

        <div className="header-right">
          {isAuthenticated ? (
            <>
              <span className="user-name">{user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-link">login</Link>
              <Link to="/signup" className="btn-link">signup</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;