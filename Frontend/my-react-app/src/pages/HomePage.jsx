// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { tokenManager } from '../utils/tokenManager';
import '../styles/HomePage.css';

const HomePage = () => {
  const isAuthenticated = tokenManager.isAuthenticated();

  return (
    <div className="home-page">
      <div className="container">
        <div className="hero">
          <h1 className="hero-title">InternHunt</h1>
          <p className="hero-subtitle">
            find internships in one place
          </p>
          
          <div className="hero-description">
            <p>
              aggregates opportunities from multiple sources • filters by role,
              skills, and location • saves time searching
            </p>
          </div>

          <div className="hero-actions">
            {isAuthenticated ? (
              <Link to="/internships" className="btn btn-primary btn-large">
                browse internships
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-large">
                  get started
                </Link>
                <Link to="/login" className="btn btn-large">
                  login
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="features">
          <div className="feature">
            <h3>aggregated listings</h3>
            <p>
              pulls from internshala, indeed, and glassdoor so you don't have to
              check multiple sites
            </p>
          </div>

          <div className="feature">
            <h3>smart filtering</h3>
            <p>
              filter by role, location, skills, and deadline to find exactly what
              you need
            </p>
          </div>

          <div className="feature">
            <h3>track applications</h3>
            <p>
              mark applications as applied or save them for later review
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;