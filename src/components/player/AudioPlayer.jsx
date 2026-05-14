import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getTrackAudioUrl, getTrackCoverUrl } from '@/lib/mediaUrl';

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

const FALLBACK_COVER =
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop';

const AudioPlayer = ({
  track,
  onNext,
  onPrevious,
  isFavorite,
  onToggleFavorite,
  isDark = true,
  /** Увеличивайте на 1 при повторном выборе того же трека в списке — пауза / возобновление */
  playbackToggle = 0,
  /** Сообщает родителю о реальном состоянии воспроизведения (для подсветки строки) */
  onPlayingChange,
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  /** Пока тянем ползунок времени — не перезатираем позицию из onTimeUpdate */
  const [scrubTime, setScrubTime] = useState(null);

  const theme = isDark ? THEME.dark : THEME.light;
  const audioSrc = track ? getTrackAudioUrl(track) : null;
  const coverSrc = track ? getTrackCoverUrl(track) || FALLBACK_COVER : FALLBACK_COVER;
  const canSkipBack = typeof onPrevious === 'function';
  const canSkipFwd = typeof onNext === 'function';

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    setLoadError(false);
    setScrubTime(null);
    setCurrentTime(0);
    setDuration(0);

    if (!audioSrc) {
      setIsPlaying(false);
      setIsLoading(false);
      audio.removeAttribute('src');
      audio.load();
      return;
    }

    setIsLoading(true);
    setIsPlaying(false);

    audio.pause();
    audio.src = audioSrc;
    audio.load();
    audio.volume = isMuted ? 0 : volume;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch(() => {
          setIsPlaying(false);
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      audio.pause();
    };
  }, [track?.id, audioSrc]);

  /** Повторный клик по тому же треку в списке */
  useEffect(() => {
    if (!playbackToggle) return;
    const audio = audioRef.current;
    if (!audio || !audioSrc || !track) return;
    if (audio.paused) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [playbackToggle, audioSrc, track?.id]);

  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  useEffect(() => {
    if (!track) {
      onPlayingChange?.(false);
    }
  }, [track, onPlayingChange]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || isLoading || !audioSrc) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch((error) => console.error('Playback failed:', error));
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || scrubTime != null) return;
    setCurrentTime(audio.currentTime);
  };

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration || 0);
  };

  const handleSeekChange = (value) => {
    const audio = audioRef.current;
    const nextTime = value[0];
    setScrubTime(nextTime);
    if (audio) {
      audio.currentTime = nextTime;
    }
  };

  const handleSeekCommit = () => {
    const audio = audioRef.current;
    setScrubTime(null);
    if (audio) setCurrentTime(audio.currentTime);
  };

  const handleVolumeChange = (value) => {
    const nextVolume = value[0] / 100;
    setVolume(nextVolume);
    setIsMuted(false);
  };

  const handleAudioError = () => {
    setLoadError(true);
    setIsPlaying(false);
    setIsLoading(false);
  };

  const formatTime = (time) => {
    if (isNaN(time) || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const sliderDisplayTime = scrubTime != null ? scrubTime : currentTime;
  const timeMax = Math.max(duration || 0, 1);

  const bumpVolume = useCallback(
    (delta) => {
      setIsMuted(false);
      setVolume((v) => Math.min(1, Math.max(0, v + delta)));
    },
    []
  );

  useEffect(() => {
    if (!track || !audioSrc) return;

    const onKey = (e) => {
      const tag = e.target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || e.target?.isContentEditable) {
        return;
      }
      if (e.target.closest?.('[role="slider"]')) return;

      if (e.key === 'ArrowRight' && canSkipFwd) {
        e.preventDefault();
        onNext();
      } else if (e.key === 'ArrowLeft' && canSkipBack) {
        e.preventDefault();
        onPrevious();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        bumpVolume(0.05);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        bumpVolume(-0.05);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [track, audioSrc, onNext, onPrevious, canSkipFwd, canSkipBack, bumpVolume]);

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
          onEnded={() => {
            setIsPlaying(false);
            if (typeof onNext === 'function') onNext();
          }}
          onError={handleAudioError}
        />

        <div className="max-w-5xl mx-auto flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
            <motion.div
              className="flex items-center gap-2 sm:gap-3 w-full sm:w-56 min-w-0"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              key={track.id}
            >
              <motion.img
                src={coverSrc}
                alt={track.title || 'Track cover'}
                className="w-14 h-14 rounded-lg object-cover shadow-lg shrink-0"
                animate={
                  isPlaying
                    ? {
                        boxShadow: [
                          '0 0 20px rgba(168,85,247,0.3)',
                          '0 0 30px rgba(168,85,247,0.5)',
                          '0 0 20px rgba(168,85,247,0.3)',
                        ],
                      }
                    : {}
                }
                transition={{ duration: 2, repeat: Infinity }}
              />
              <div className="min-w-0 flex-1">
                <p className={cn('font-medium truncate text-sm', theme.text)}>{track.title}</p>
                <p className={cn('text-xs truncate', theme.textSecondary)}>{track.artist_name}</p>
                {loadError && (
                  <p className="text-xs text-red-400 truncate">Не удалось воспроизвести файл</p>
                )}
                {!audioSrc && !loadError && (
                  <p className="text-xs text-amber-400/90 truncate">Нет URL аудио (проверьте API)</p>
                )}
              </div>

              {onToggleFavorite && (
                <motion.button
                  onClick={onToggleFavorite}
                  className="ml-2 shrink-0 p-2 rounded-full hover:bg-white/10"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
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

            <div className="flex-1 flex flex-col items-center gap-2 w-full">
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={() => canSkipBack && onPrevious()}
                  disabled={!canSkipBack}
                  className={cn(
                    'p-2 rounded-full',
                    canSkipBack ? theme.textSecondary : 'opacity-30 cursor-not-allowed'
                  )}
                  whileHover={canSkipBack ? { scale: 1.1 } : {}}
                  whileTap={canSkipBack ? { scale: 0.9 } : {}}
                  type="button"
                >
                  <SkipBack className="w-5 h-5" />
                </motion.button>

                <motion.button
                  onClick={togglePlay}
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center shadow-lg',
                    theme.buttonBg,
                    (!audioSrc || loadError) && 'opacity-50 cursor-not-allowed'
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isLoading || !audioSrc || loadError}
                  type="button"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </motion.button>

                <motion.button
                  onClick={() => canSkipFwd && onNext()}
                  disabled={!canSkipFwd}
                  className={cn(
                    'p-2 rounded-full',
                    canSkipFwd ? theme.textSecondary : 'opacity-30 cursor-not-allowed'
                  )}
                  whileHover={canSkipFwd ? { scale: 1.1 } : {}}
                  whileTap={canSkipFwd ? { scale: 0.9 } : {}}
                  type="button"
                >
                  <SkipForward className="w-5 h-5" />
                </motion.button>
              </div>

              <div className="w-full max-w-md flex items-center gap-3">
                <span className={cn('text-xs w-10 text-right shrink-0', theme.textSecondary)}>
                  {formatTime(sliderDisplayTime)}
                </span>
                <Slider
                  value={[Math.min(sliderDisplayTime, timeMax)]}
                  max={timeMax}
                  step={0.25}
                  min={0}
                  onValueChange={handleSeekChange}
                  onValueCommit={handleSeekCommit}
                  disabled={!audioSrc || loadError}
                  className="flex-1"
                />
                <span className={cn('text-xs w-10 shrink-0', theme.textSecondary)}>
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center sm:justify-end gap-2 w-full sm:w-36 lg:w-40 shrink-0">
              <motion.button
                onClick={() => setIsMuted(!isMuted)}
                className={cn('p-2 rounded-full', theme.textSecondary)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </motion.button>
              <Slider
                value={[isMuted ? 0 : volume * 100]}
                max={100}
                step={1}
                min={0}
                onValueChange={handleVolumeChange}
                className="w-24 sm:w-20 lg:w-28"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

AudioPlayer.displayName = 'AudioPlayer';

export default AudioPlayer;
