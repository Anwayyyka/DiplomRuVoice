import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Home, Heart, BarChart3, Sun, Moon, Upload, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from './contexts/ThemeContext';
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { mockUser } from '@/mocks/user';

export default function Layout({ children }) {
  const location = useLocation();
  const { isDark, setIsDark } = useTheme();
  const [user] = useState(mockUser); // или null для неавторизованного

  // Базовые пункты меню
  const navItems = [
    { name: 'Главная', path: '/', icon: Home },
    { name: 'Поиск', path: '/search', icon: Search },
    { name: 'Любимое', path: '/favorites', icon: Heart },
    { name: 'Чарты', path: '/charts', icon: BarChart3 },
  ];

  if (user) {
    navItems.push({ name: 'Загрузить', path: '/upload', icon: Upload });
    if (user.role === 'admin') {
      navItems.push({ name: 'Модерация', path: '/moderation', icon: Shield });
    }
  }

  const isActive = (path) => location.pathname === path;

  const sidebarClasses = isDark
    ? 'bg-zinc-950/90 border-zinc-800 backdrop-blur-xl'
    : 'bg-white/90 border-gray-200 backdrop-blur-xl';

  const handleLogout = () => {
    console.log('Logout');
    // Здесь можно добавить toast или другую логику
  };

  const handleLogin = () => {
    console.log('Login');
    // Здесь можно добавить toast или перенаправление
  };

  return (
    <div className={cn('min-h-screen flex', isDark ? 'text-white' : 'text-gray-900')}>
      {/* Единый анимированный фон */}
      <AnimatedBackground isDark={isDark} />

      {/* Sidebar */}
      <motion.aside
        className={cn('fixed left-0 top-0 bottom-0 w-48 border-r flex flex-col z-50', sidebarClasses)}
        initial={{ x: -200 }}
        animate={{ x: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Logo */}
        <div className="p-6">
          <Link to="/" className="block">
            <motion.h1
              className={cn(
                'text-2xl font-bold tracking-wider',
                isDark ? 'text-white' : 'text-gray-900'
              )}
              style={{ fontFamily: 'serif', fontStyle: 'italic' }}
              whileHover={{ scale: 1.05 }}
            >
              RUVOICE
            </motion.h1>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link key={item.path} to={item.path}>
                <motion.div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-colors',
                    isDark
                      ? active
                        ? 'bg-purple-600/20 text-purple-400'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      : active
                      ? 'bg-purple-100 text-purple-600'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                  )}
                  whileHover={{ x: 4 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="px-4 py-2">
          <motion.button
            onClick={() => setIsDark(!isDark)}
            className={cn(
              'flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium',
              isDark ? 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {isDark ? 'Светлая тема' : 'Тёмная тема'}
          </motion.button>
        </div>

        {/* User Profile */}
        <div className={cn('p-4 border-t', isDark ? 'border-zinc-800' : 'border-gray-200')}>
          {user ? (
            <div className="space-y-2">
              <Link to="/profile">
                <motion.div className="flex items-center gap-3" whileHover={{ x: 4 }}>
                  <Avatar className="h-10 w-10 ring-2 ring-purple-500/50">
                    <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                      {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium truncate', isDark ? 'text-white' : 'text-gray-900')}>
                      {user.full_name || 'Пользователь'}
                    </p>
                    <p className={cn('text-xs truncate', isDark ? 'text-zinc-500' : 'text-gray-500')}>
                      {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </p>
                  </div>
                </motion.div>
              </Link>
              <motion.button
                onClick={handleLogout}
                className={cn(
                  'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs',
                  isDark ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                )}
                whileHover={{ x: 2 }}
              >
                <LogOut className="w-3 h-3" />
                Выйти
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={handleLogin}
              className={cn(
                'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium',
                'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Войти
            </motion.button>
          )}
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-48">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            className="min-h-screen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {React.cloneElement(children, { isDark })}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}