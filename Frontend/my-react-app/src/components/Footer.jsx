// src/components/Footer.jsx
import React from 'react';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-links">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <span className="separator">|</span>
          <a href="/about">About</a>
          <span className="separator">|</span>
          <a href="/contact">Contact</a>
        </div>
        <div className="footer-text">
          InternHunt &copy; 2025
        </div>
      </div>
    </footer>
  );
};

export default Footer;