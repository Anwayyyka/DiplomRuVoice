import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function Register() {
  const { isDark } = useTheme();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

const handleSubmit = async (e) => {
  e.preventDefault();
  if (password !== confirmPassword) {
    toast.error('Пароли не совпадают');
    return;
  }
  setIsLoading(true);
  try {
    await register(email, password, fullName);
    toast.success('Регистрация прошла успешно!');
    navigate('/');
  } catch (error) {
    console.error(error);
    toast.error(error.message || 'Ошибка при регистрации');
  } finally {
    setIsLoading(false);
  }
};

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark
    ? 'bg-zinc-800/50 backdrop-blur-sm border-zinc-700'
    : 'bg-white/80 backdrop-blur-sm border-gray-200';
  const inputBg = isDark
    ? 'bg-zinc-900 border-zinc-700 !text-white placeholder:!text-zinc-400'
    : 'bg-white border-gray-200 text-gray-900 placeholder:text-gray-400';

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className={cn('border', cardBg)}>
          <CardHeader className="space-y-1">
            <CardTitle className={cn('text-2xl text-center', textClass)}>Регистрация</CardTitle>
            <CardDescription className={cn('text-center', textSecondary)}>
              Создайте новый аккаунт
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className={textSecondary}>Имя</Label>
                <Input
                  id="fullName"
                  placeholder="Иван Петров"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className={inputBg}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className={textSecondary}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputBg}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className={textSecondary}>Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputBg}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className={textSecondary}>Подтверждение пароля</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={inputBg}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                disabled={isLoading}
              >
                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm">
              <span className={textSecondary}>Уже есть аккаунт? </span>
              <Link to="/login" className="text-purple-500 hover:underline">
                Войти
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}