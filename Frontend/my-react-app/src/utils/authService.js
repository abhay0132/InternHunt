// src/utils/authService.js
import axiosInstance from './axiosInstance';
import { tokenManager } from './tokenManager';

export const authService = {
  signup: async (userData) => {
    const response = await axiosInstance.post('/auth/signup', userData);
    const { accessToken, refreshToken, user } = response.data.data;
    
    tokenManager.setTokens(accessToken, refreshToken);
    tokenManager.setUser(user);
    
    return response.data;
  },

  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    const { accessToken, refreshToken, user } = response.data.data;
    
    tokenManager.setTokens(accessToken, refreshToken);
    tokenManager.setUser(user);
    
    return response.data;
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
    }
  },

  getCurrentUser: async () => {
    const response = await axiosInstance.get('/auth/me');
    return response.data.data.user;
  },
};