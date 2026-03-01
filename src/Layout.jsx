import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Search, Home, Heart, BarChart3, Sun, Moon, Upload, Shield, LogOut, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import AnimatedBackground from '@/components/ui/AnimatedBackground';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Layout({ children }) {
  const location = useLocation();
  const { isDark, setIsDark } = useTheme();
  const { user, logout } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  // Избранное показываем только авторизованным (проверяем явно по user.id или token)
  const isLoggedIn = Boolean(user && (user.id != null || user.email));
  const navItems = [
    { name: 'Главная', path: '/', icon: Home },
    { name: 'Поиск', path: '/search', icon: Search },
    ...(isLoggedIn ? [{ name: 'Любимое', path: '/favorites', icon: Heart }] : []),
    { name: 'Чарты', path: '/charts', icon: BarChart3 },
  ];

  if (isLoggedIn) {
    if (user.role === 'artist' || user.role === 'admin') {
      navItems.push({ name: 'Загрузить', path: '/upload', icon: Upload });
    }
    if (user.role === 'admin') {
      navItems.push({ name: 'Модерация', path: '/moderation', icon: Shield });
    }
  }
  const isActive = (path) => location.pathname === path;

  const sidebarClasses = isDark
    ? 'bg-zinc-950/90 border-zinc-800 backdrop-blur-xl'
    : 'bg-white/90 border-gray-200 backdrop-blur-xl';

  const handleLogout = () => {
    logout();
  };

  const handleLogin = () => {
    // Перенаправление на страницу входа
    window.location.href = '/login';
  };

  const SidebarContent = ({ onNavClick }) => (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6">
        <Link to="/" onClick={onNavClick} className="block">
          <h1
            className={cn('text-2xl font-bold tracking-wider', isDark ? 'text-white' : 'text-gray-900')}
            style={{ fontFamily: 'serif', fontStyle: 'italic' }}
          >
            RUVOICE
          </h1>
        </Link>
      </div>
      <nav className="flex-1 px-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link key={item.path} to={item.path} onClick={onNavClick}>
              <div
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-colors',
                  isDark
                    ? active ? 'bg-purple-600/20 text-purple-400' : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    : active ? 'bg-purple-100 text-purple-600' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-2">
        <button
          type="button"
          onClick={() => setIsDark(!isDark)}
          className={cn(
            'flex items-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-medium',
            isDark ? 'bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700/50' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDark ? 'Светлая тема' : 'Тёмная тема'}
        </button>
      </div>
      <div className={cn('p-4 border-t', isDark ? 'border-zinc-800' : 'border-gray-200')}>
        {user ? (
          <div className="space-y-2">
            <Link to="/profile" onClick={onNavClick}>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 shrink-0 ring-2 ring-purple-500/50">
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
              </div>
            </Link>
            <button
              type="button"
              onClick={() => { handleLogout(); onNavClick?.(); }}
              className={cn(
                'flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs',
                isDark ? 'text-zinc-500 hover:text-red-400 hover:bg-red-500/10' : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
              )}
            >
              <LogOut className="w-3 h-3" />
              Выйти
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { handleLogin(); onNavClick?.(); }}
            className={cn(
              'flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium',
              'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            )}
          >
            Войти
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn('min-h-screen flex overflow-x-hidden', isDark ? 'text-white' : 'text-gray-900')}>
      <AnimatedBackground isDark={isDark} />

      {/* Десктоп: фиксированный сайдбар (скрыт на мобильных) */}
      <aside
        className={cn(
          'hidden md:flex fixed left-0 top-0 bottom-0 w-48 border-r flex-col z-40',
          sidebarClasses
        )}
      >
        <SidebarContent />
      </aside>

      {/* Мобильный: кнопка меню + Sheet */}
      <div className={cn('md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 border-b backdrop-blur-xl', isDark ? 'border-zinc-800 bg-zinc-950/80' : 'border-gray-200 bg-white/80')}>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className={isDark ? 'text-white' : 'text-gray-900'}>
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className={cn('w-64 p-0', sidebarClasses)}>
            <SidebarContent onNavClick={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
        <Link to="/" className="text-xl font-bold tracking-wider" style={{ fontFamily: 'serif', fontStyle: 'italic' }}>
          RUVOICE
        </Link>
        <div className="w-10" />
      </div>

      <main className="flex-1 w-full min-w-0 pt-14 md:pt-0 md:ml-48">
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