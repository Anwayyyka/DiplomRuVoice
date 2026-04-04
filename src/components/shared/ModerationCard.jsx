import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User, Music, Disc, Calendar } from 'lucide-react';

const STATUS_CONFIG = {
  pending: { label: 'На проверке', className: 'bg-yellow-500/20 text-yellow-500' },
  approved: { label: 'Одобрено', className: 'bg-green-500/20 text-green-500' },
  rejected: { label: 'Отклонено', className: 'bg-red-500/20 text-red-500' },
};

/**
 * Универсальная карточка элемента модерации: заявка артиста, трек или альбом.
 * Компактное отображение с основными данными и статусом (бейдж).
 *
 * @param {Object} props
 * @param {'artist' | 'track' | 'album'} props.variant - тип элемента
 * @param {Object} props.item - данные (artistName, title, date, status, bio и т.д.)
 * @param {Function} props.onClick - при клике (открыть модалку)
 * @param {boolean} [props.isDark]
 */
export default function ModerationCard({ variant, item, onClick, isDark = true }) {
  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-zinc-900/80 border-zinc-700' : 'bg-white/80 border-gray-200';

  const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
  const dateStr = item.date
    ? new Date(item.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  const title =
    variant === 'artist' ? item.artistName || item.name
    : variant === 'album' ? item.albumTitle || item.title
    : item.title;

  const subtitle =
    variant === 'artist' ? (item.bio ? item.bio.slice(0, 80) + (item.bio.length > 80 ? '…' : '') : '')
    : variant === 'track' ? item.artistName
    : item.artistName;

  const Icon = variant === 'artist' ? User : variant === 'album' ? Disc : Music;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        cardBg
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg',
              isDark ? 'bg-zinc-800' : 'bg-gray-100'
            )}
          >
            <Icon className={cn('h-6 w-6', textSecondary)} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={cn('font-semibold truncate', textClass)}>{title}</h3>
            {subtitle && (
              <p className={cn('text-sm truncate', textSecondary)}>{subtitle}</p>
            )}
            <div className={cn('flex items-center gap-2 mt-1.5 text-xs', textSecondary)}>
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{dateStr}</span>
            </div>
          </div>
          <Badge className={cn('shrink-0', status.className)}>{status.label}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
