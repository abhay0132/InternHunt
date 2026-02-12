// src/components/GuestRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { tokenManager } from '../utils/tokenManager';

const GuestRoute = ({ children }) => {
  if (tokenManager.isAuthenticated()) {
    return <Navigate to="/internships" replace />;
  }

  return children;
};

export default GuestRoute;