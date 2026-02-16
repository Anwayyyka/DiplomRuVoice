import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Play, Pause, Heart, MessageCircle, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import AudioPlayer from '../components/player/AudioPlayer';
import { mockTrack, mockComments, mockLikes, mockUser } from '@/mocks/trackPageData';
import { useTheme } from '../contexts/ThemeContext';

export default function TrackPage() {
     const { isDark } = useTheme();
  const [searchParams] = useSearchParams();
  const trackId = searchParams.get('id') || '1';
  const [currentTrack, setCurrentTrack] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [track, setTrack] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setTrack(mockTrack);
      setComments(mockComments);
      setLikes(mockLikes);
      setUser(mockUser);
      setLoading(false);
    }, 500);
  }, [trackId]);

  const isLiked = likes.some(l => l.user_email === user?.email);

  const handlePlay = () => {
    setCurrentTrack(track);
    setTrack(prev => prev ? { ...prev, plays_count: (prev.plays_count || 0) + 1 } : prev);
  };

  const toggleLike = () => {
    if (!user || !track) return;
    if (isLiked) {
      setLikes(prev => prev.filter(l => l.user_email !== user.email));
      setTrack(prev => prev ? { ...prev, likes_count: Math.max(0, (prev.likes_count || 0) - 1) } : prev);
    } else {
      const newLike = {
        id: `like-${Date.now()}`,
        track_id: track.id,
        user_email: user.email,
        created_date: new Date().toISOString(),
      };
      setLikes(prev => [...prev, newLike]);
      setTrack(prev => prev ? { ...prev, likes_count: (prev.likes_count || 0) + 1 } : prev);
    }
  };

  const addComment = () => {
    if (!user || !newComment.trim() || !track) return;
    const comment = {
      id: `comment-${Date.now()}`,
      track_id: track.id,
      user_email: user.email,
      user_name: user.full_name || 'Пользователь',
      text: newComment,
      created_date: new Date().toISOString(),
    };
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-zinc-800/50 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';

  if (loading || !track) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-8 pb-32">
      <motion.div
        className={cn('rounded-2xl p-6 mb-8', cardBg)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex gap-6 flex-col md:flex-row">
          <div className="relative w-full md:w-48 h-48 rounded-xl overflow-hidden shrink-0">
            <img
              src={track.cover_url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop'}
              alt={track.title}
              className="w-full h-full object-cover"
            />
            <motion.button
              onClick={handlePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
                {currentTrack?.id === track.id ? (
                  <Pause className="w-8 h-8 text-black" />
                ) : (
                  <Play className="w-8 h-8 text-black ml-1" />
                )}
              </div>
            </motion.button>
          </div>

          <div className="flex-1">
            <h1 className={cn('text-3xl font-bold mb-2', textClass)}>{track.title}</h1>
            <Link
              to={`/artist?email=${encodeURIComponent(track.created_by)}`}
              className={cn('text-lg hover:underline', textSecondary)}
            >
              {track.artist_name}
            </Link>

            {track.description && <p className={cn('mt-4', textSecondary)}>{track.description}</p>}

            <div className="flex items-center gap-6 mt-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-purple-500" />
                <span className={textClass}>{track.plays_count || 0} прослушиваний</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart
                  className={cn('w-5 h-5', isLiked ? 'fill-red-500 text-red-500' : 'text-zinc-400')}
                />
                <span className={textClass}>{likes.length} лайков</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <span className={textClass}>{comments.length} комментариев</span>
              </div>
            </div>

            <div className="flex gap-3 mt-6 flex-wrap">
              <Button onClick={handlePlay} className="bg-purple-600 hover:bg-purple-700">
                <Play className="w-4 h-4 mr-2" />
                Слушать
              </Button>
              {user && (
                <Button
                  variant="outline"
                  onClick={toggleLike}
                  className={cn(isLiked && 'border-red-500 text-red-500')}
                >
                  <Heart className={cn('w-4 h-4 mr-2', isLiked && 'fill-red-500')} />
                  {isLiked ? 'В избранном' : 'Нравится'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        className={cn('rounded-2xl p-6', cardBg)}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className={cn('text-xl font-bold mb-6', textClass)}>
          Комментарии ({comments.length})
        </h2>

        {user ? (
          <div className="flex gap-4 mb-6">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                {user.full_name?.[0] || user.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Напишите комментарий..."
                className={cn('mb-2', isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-gray-50 border-gray-200')}
              />
              <Button onClick={addComment} disabled={!newComment.trim()} size="sm">
                <Send className="w-4 h-4 mr-2" />
                Отправить
              </Button>
            </div>
          </div>
        ) : (
          <p className={cn('mb-6', textSecondary)}>Войдите, чтобы оставить комментарий</p>
        )}

        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              className={cn('flex gap-4 p-4 rounded-xl', isDark ? 'bg-zinc-900/50' : 'bg-gray-50')}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Avatar className="h-10 w-10">
                <AvatarFallback className={isDark ? 'bg-zinc-700' : 'bg-gray-300'}>
                  {comment.user_name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn('font-medium', textClass)}>{comment.user_name}</span>
                  <span className={cn('text-xs', textSecondary)}>
                    {format(new Date(comment.created_date), 'd MMM yyyy', { locale: ru })}
                  </span>
                </div>
                <p className={textSecondary}>{comment.text}</p>
              </div>
            </motion.div>
          ))}
          {comments.length === 0 && (
            <p className={cn('text-center py-8', textSecondary)}>Пока нет комментариев</p>
          )}
        </div>
      </motion.div>

      <AudioPlayer
        track={currentTrack}
        onNext={() => {}}
        onPrevious={() => {}}
        isDark={isDark}
      />
    </div>
  );
}