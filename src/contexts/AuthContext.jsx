import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { toast } from 'sonner';
import { readAuthTokenFromResponse } from '@/lib/authToken';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getProfile()
        .then(userData => setUser(userData))
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const data = await authAPI.login({ email, password });
      const token = readAuthTokenFromResponse(data);
      if (!token) {
        const err = new Error('Сервер не вернул токен авторизации');
        toast.error(err.message);
        throw err;
      }
      localStorage.setItem('token', token);
      setUser(data.user ?? data);
      toast.success('Вы успешно вошли!');
      navigate('/');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const data = await authAPI.register(email, password, fullName);
      const token = readAuthTokenFromResponse(data);
      if (!token) {
        const err = new Error('Сервер не вернул токен авторизации');
        toast.error(err.message);
        throw err;
      }
      localStorage.setItem('token', token);
      setUser(data.user ?? data);
      toast.success('Регистрация прошла успешно!');
      navigate('/');
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Вы вышли из аккаунта');
    navigate('/login');
  };

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem('token')) return;
    try {
      const userData = await authAPI.getProfile();
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Failed to refresh user', err);
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);