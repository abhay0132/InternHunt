// src/utils/tokenManager.js
const TOKEN_KEY = 'internhunt_access_token';
const REFRESH_TOKEN_KEY = 'internhunt_refresh_token';
const USER_KEY = 'internhunt_user';

export const tokenManager = {
  getAccessToken: () => localStorage.getItem(TOKEN_KEY),
  
  getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),
  
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  
  getUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },
  
  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  
  isAuthenticated: () => {
    return !!tokenManager.getAccessToken();
  }
};