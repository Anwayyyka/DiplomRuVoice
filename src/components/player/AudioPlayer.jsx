import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const THEME = {
  dark: {
    bg: 'bg-zinc-900/95 border-zinc-800 backdrop-blur-xl',
    text: 'text-white',
    textSecondary: 'text-zinc-400',
    buttonBg: 'bg-white text-black',
  },
  light: {
    bg: 'bg-white/95 border-gray-200 backdrop-blur-xl',
    text: 'text-gray-900',
    textSecondary: 'text-gray-500',
    buttonBg: 'bg-gray-900 text-white',
  },
};

const AudioPlayer = ({
  track,
  onNext,
  onPrevious,
  isFavorite,
  onToggleFavorite,
  isDark = true,
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const theme = isDark ? THEME.dark : THEME.light;

  useEffect(() => {
    if (!track?.audio_url) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.src = track.audio_url;
    audio.load();
    setIsPlaying(false);
    setCurrentTime(0);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      setIsLoading(true);
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((error) => {
          console.log('Autoplay prevented:', error);
          setIsPlaying(false);
          setIsLoading(false);
        });
    }
  }, [track?.id]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play()
        .then(() => setIsPlaying(true))
        .catch((error) => console.error('Playback failed:', error));
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
  };

  const handleSeek = (value) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value) => {
    setVolume(value[0] / 100);
    setIsMuted(false);
  };

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!track) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={cn('fixed bottom-0 left-0 md:left-48 right-0 border-t p-3 sm:p-4 z-40', theme.bg)}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={onNext}
        />

        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
          {/* Информация о треке */}
          <motion.div
            className="flex items-center gap-2 sm:gap-3 w-full sm:w-56 min-w-0"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            key={track.id}
          >
            <motion.img
              src={track.cover_url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"}
              alt={track.title}
              className="w-14 h-14 rounded-lg object-cover shadow-lg"
              animate={isPlaying ? { boxShadow: ['0 0 20px rgba(168,85,247,0.3)', '0 0 30px rgba(168,85,247,0.5)', '0 0 20px rgba(168,85,247,0.3)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="min-w-0">
              <p className={cn('font-medium truncate text-sm', theme.text)}>{track.title}</p>
              <p className={cn('text-xs truncate', theme.textSecondary)}>{track.artist_name}</p>
            </div>
            {onToggleFavorite && (
              <motion.button
                onClick={onToggleFavorite}
                className="ml-2 shrink-0 p-2 rounded-full hover:bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Heart
                  className={cn(
                    'w-5 h-5',
                    isFavorite ? 'fill-red-500 text-red-500' : theme.textSecondary
                  )}
                />
              </motion.button>
            )}
          </motion.div>

          {/* Основные элементы управления */}
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <motion.button
                onClick={onPrevious}
                className={cn('p-2 rounded-full', theme.textSecondary)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SkipBack className="w-5 h-5" />
              </motion.button>
              <motion.button
                onClick={togglePlay}
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center shadow-lg',
                  theme.buttonBg
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 ml-0.5" />
                )}
              </motion.button>
              <motion.button
                onClick={onNext}
                className={cn('p-2 rounded-full', theme.textSecondary)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <SkipForward className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Прогресс-бар */}
            <div className="w-full max-w-md flex items-center gap-3">
              <span className={cn('text-xs w-10 text-right', theme.textSecondary)}>
                {formatTime(currentTime)}
              </span>
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleSeek}
                className="flex-1"
              />
              <span className={cn('text-xs w-10', theme.textSecondary)}>
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Регулятор громкости (скрыт на очень узких экранах) */}
          <div className="hidden sm:flex items-center gap-2 w-24 lg:w-32">
            <motion.button
              onClick={() => setIsMuted(!isMuted)}
              className={cn('p-2 rounded-full', theme.textSecondary)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </motion.button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;