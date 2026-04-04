import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, TrendingUp, DollarSign, Headphones, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { tracksAPI } from '@/api/tracks';

const PRICE_PER_PLAY = 0.5; // рублей за прослушивание
const PRICE_PER_LIKE = 2; // рублей за лайк

export default function Statistics() {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [period, setPeriod] = useState('30');
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [myTracks, setMyTracks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyTracks = useCallback(async () => {
    if (!user || user.role !== 'artist') return;
    setLoading(true);
    try {
      const tracks = await tracksAPI.getUserTracks(user.id);
      setMyTracks(tracks.filter(t => t.status === 'approved'));
    } catch (error) {
      console.error('Failed to load tracks:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMyTracks();
  }, [fetchMyTracks]);

  const filteredTracks = useMemo(() => {
    return selectedTrack === 'all' ? myTracks : myTracks.filter(t => t.id === selectedTrack);
  }, [myTracks, selectedTrack]);

  const stats = useMemo(() => {
    const totalPlays = filteredTracks.reduce((sum, t) => sum + (t.plays_count || 0), 0);
    const totalLikes = filteredTracks.reduce((sum, t) => sum + (t.likes_count || 0), 0);
    const earnings = totalPlays * PRICE_PER_PLAY + totalLikes * PRICE_PER_LIKE;

    return {
      totalPlays,
      totalLikes,
      earnings: earnings.toFixed(2),
      avgPlaysPerTrack: filteredTracks.length > 0 ? (totalPlays / filteredTracks.length).toFixed(0) : 0,
      tracksCount: filteredTracks.length
    };
  }, [filteredTracks]);

  // Симуляция данных графика на основе реальных сумм и периода
  const chartData = useMemo(() => {
    const days = parseInt(period);
    const data = [];

    if (filteredTracks.length === 0) return [];

    const totalPlays = filteredTracks.reduce((sum, t) => sum + (t.plays_count || 0), 0);
    const totalLikes = filteredTracks.reduce((sum, t) => sum + (t.likes_count || 0), 0);

    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'dd MMM', { locale: ru });

      const variation = 0.5 + Math.random() * 1.0;
      const plays = Math.round((totalPlays / days) * variation);
      const likes = Math.round((totalLikes / days) * variation);

      data.push({
        date: dateStr,
        plays,
        likes,
        earnings: ((plays * PRICE_PER_PLAY) + (likes * PRICE_PER_LIKE)).toFixed(2)
      });
    }
    return data;
  }, [filteredTracks, period]);

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark
    ? 'bg-zinc-800/50 backdrop-blur-sm border-zinc-700'
    : 'bg-white/80 backdrop-blur-sm border-gray-200';

  if (!user || user.role !== 'artist') {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <p className={textSecondary}>Доступно только для артистов</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4 sm:p-6 lg:p-8 pb-32">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className={cn('text-4xl font-bold mb-2', textClass)}>Статистика</h1>
        <p className={textSecondary}>Аналитика ваших треков и заработок</p>
      </motion.div>

      {/* Фильтры */}
      <motion.div
        className="flex gap-4 mb-6 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center gap-2">
          <Calendar className={cn('w-5 h-5', textSecondary)} />
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className={cn('w-40 border', cardBg)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 дней</SelectItem>
              <SelectItem value="30">30 дней</SelectItem>
              <SelectItem value="90">90 дней</SelectItem>
              <SelectItem value="365">Год</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className={cn('w-5 h-5', textSecondary)} />
          <Select value={selectedTrack} onValueChange={setSelectedTrack}>
            <SelectTrigger className={cn('w-60 border', cardBg)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все треки</SelectItem>
              {myTracks.map(track => (
                <SelectItem key={track.id} value={track.id}>{track.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Карточки статистики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className={cn('border', cardBg)}>
            <CardHeader className="pb-2">
              <CardTitle className={cn('text-sm font-medium flex items-center gap-2', textSecondary)}>
                <DollarSign className="w-4 h-4 text-green-500" />
                Заработок
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn('text-3xl font-bold', textClass)}>{stats.earnings} ₽</p>
              <p className={cn('text-xs mt-1', textSecondary)}>за {period} дней</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card className={cn('border', cardBg)}>
            <CardHeader className="pb-2">
              <CardTitle className={cn('text-sm font-medium flex items-center gap-2', textSecondary)}>
                <Headphones className="w-4 h-4 text-blue-500" />
                Прослушивания
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn('text-3xl font-bold', textClass)}>{stats.totalPlays}</p>
              <p className={cn('text-xs mt-1', textSecondary)}>~{stats.avgPlaysPerTrack} на трек</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className={cn('border', cardBg)}>
            <CardHeader className="pb-2">
              <CardTitle className={cn('text-sm font-medium flex items-center gap-2', textSecondary)}>
                <TrendingUp className="w-4 h-4 text-purple-500" />
                Лайки
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn('text-3xl font-bold', textClass)}>{stats.totalLikes}</p>
              <p className={cn('text-xs mt-1', textSecondary)}>{stats.tracksCount} треков</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <Card className={cn('border', cardBg)}>
            <CardHeader className="pb-2">
              <CardTitle className={cn('text-sm font-medium flex items-center gap-2', textSecondary)}>
                <BarChart3 className="w-4 h-4 text-pink-500" />
                CPM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn('text-3xl font-bold', textClass)}>{PRICE_PER_PLAY} ₽</p>
              <p className={cn('text-xs mt-1', textSecondary)}>за прослушивание</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Графики */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className={cn('border', cardBg)}>
            <CardHeader>
              <CardTitle className={textClass}>Прослушивания</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#ddd'} />
                  <XAxis dataKey="date" stroke={isDark ? '#888' : '#666'} />
                  <YAxis stroke={isDark ? '#888' : '#666'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f1f1f' : '#fff',
                      border: `1px solid ${isDark ? '#333' : '#ddd'}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Line type="monotone" dataKey="plays" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <Card className={cn('border', cardBg)}>
            <CardHeader>
              <CardTitle className={textClass}>Заработок (₽)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#ddd'} />
                  <XAxis dataKey="date" stroke={isDark ? '#888' : '#666'} />
                  <YAxis stroke={isDark ? '#888' : '#666'} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? '#1f1f1f' : '#fff',
                      border: `1px solid ${isDark ? '#333' : '#ddd'}`,
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="earnings" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}