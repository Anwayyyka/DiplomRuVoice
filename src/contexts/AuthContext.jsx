import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { toast } from 'sonner';

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
      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success('Вы успешно вошли!');
      navigate('/');
      return data;
    } catch (error) {
      // Ошибку пробрасываем в компонент, чтобы он показал тост
      throw error;
    }
  };

  const register = async (email, password, fullName) => {
    try {
      const data = await authAPI.register(email, password, fullName);
      localStorage.setItem('token', data.token);
      setUser(data.user);
      toast.success('Регистрация прошла успешно!');
      navigate('/');
      return data;
    } catch (error) {
      // Ошибку пробрасываем в компонент
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Вы вышли из аккаунта');
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);