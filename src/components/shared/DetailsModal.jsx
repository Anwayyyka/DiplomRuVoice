import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';

/**
 * Модальное окно для детального просмотра заявки/трека/альбома в модерации.
 * Прокручиваемый контент, кнопки одобрения/отклонения.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onOpenChange
 * @param {string} props.title - заголовок модалки
 * @param {React.ReactNode} props.children - контент (поля, документы и т.д.)
 * @param {Function} [props.onApprove] - при одобрении
 * @param {Function} [props.onReject] - при отклонении (может потребоваться комментарий)
 * @param {boolean} [props.showRejectComment] - показывать поле комментария при отклонении
 * @param {boolean} [props.isDark]
 */
export default function DetailsModal({
  open,
  onOpenChange,
  title,
  children,
  onApprove,
  onReject,
  showRejectComment = false,
  isDark = true,
}) {
  const [rejectComment, setRejectComment] = React.useState('');

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textMuted = isDark ? 'text-zinc-400' : 'text-gray-600';
  const contentBg = isDark ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200';

  const handleReject = () => {
    onReject?.(rejectComment);
    setRejectComment('');
    onOpenChange(false);
  };

  const handleClose = () => {
    setRejectComment('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn('w-[95vw] max-w-2xl max-h-[90vh] flex flex-col', contentBg)}
      >
        <DialogHeader>
          <DialogTitle className={textClass}>{title}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[60vh] pr-4 -mr-4">
          <div className="space-y-4">{children}</div>
        </ScrollArea>

        {showRejectComment && (
          <div className="space-y-2">
            <label className={cn('text-sm font-medium', textClass)}>
              Комментарий (причина отклонения)
            </label>
            <textarea
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Укажите причину отклонения..."
              className={cn(
                'w-full min-h-[80px] rounded-md border px-3 py-2 text-sm',
                isDark ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500' : 'bg-white border-gray-300 text-gray-900'
              )}
            />
          </div>
        )}

        <DialogFooter className="gap-2 flex-wrap">
          {onApprove && (
            <Button
              onClick={() => {
                onApprove();
                onOpenChange(false);
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              Одобрить
            </Button>
          )}
          {onReject && (
            <Button
              variant="outline"
              onClick={showRejectComment ? handleReject : () => { onReject(); onOpenChange(false); }}
              disabled={showRejectComment && !rejectComment.trim()}
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <X className="h-4 w-4 mr-2" />
              Отклонить
            </Button>
          )}
          <Button variant="secondary" onClick={handleClose}>
            Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
