import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Upload, FileText, Image, X } from 'lucide-react';

/**
 * Компонент загрузки файлов: drag & drop, превью списка, имитация прогресса.
 * Поддержка нескольких файлов, отображение имени/размера, кнопка удаления.
 *
 * @param {Object} props
 * @param {string} [props.accept] - accept для input (напр. ".pdf,image/jpeg,image/png")
 * @param {boolean} [props.multiple] - разрешить несколько файлов
 * @param {Function} [props.onChange] - (files: File[]) => void
 * @param {boolean} [props.isDark]
 * @param {string} [props.label] - подпись над зоной
 */
export default function FileUploader({
  accept = '.pdf,image/jpeg,image/png',
  multiple = true,
  onChange,
  isDark = true,
  label = 'Загрузите файлы',
}) {
  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(null); // { fileIndex, value }
  const [isDragging, setIsDragging] = useState(false);

  const borderDashed = isDark
    ? 'border-zinc-600 hover:border-zinc-500'
    : 'border-gray-300 hover:border-gray-400';
  const textMuted = isDark ? 'text-zinc-400' : 'text-gray-500';
  const cardBg = isDark ? 'bg-zinc-800/50 border-zinc-700' : 'bg-gray-100 border-gray-200';

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} Б`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
  };

  const addFiles = useCallback(
    (newFiles) => {
      const list = multiple ? [...files, ...Array.from(newFiles)] : Array.from(newFiles);
      setFiles(list);
      onChange?.(list);

      // Имитация прогресса загрузки для последнего добавленного файла
      if (list.length > 0) {
        const lastIndex = list.length - 1;
        setUploadProgress({ fileIndex: lastIndex, value: 0 });
        let value = 0;
        const interval = setInterval(() => {
          value += 10;
          setUploadProgress({ fileIndex: lastIndex, value });
          if (value >= 100) {
            clearInterval(interval);
            setUploadProgress(null);
          }
        }, 80);
      }
    },
    [files, multiple, onChange]
  );

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files;
    if (dropped?.length) addFiles(dropped);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e) => {
    const selected = e.target.files;
    if (selected?.length) addFiles(selected);
    e.target.value = '';
  };

  const removeFile = (index) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    onChange?.(next);
    setUploadProgress(null);
  };

  const isPdf = (file) => file.type === 'application/pdf';
  const isImage = (file) => (file.type || '').startsWith('image/');

  return (
    <div className="space-y-3">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer',
          borderDashed,
          isDragging && (isDark ? 'border-purple-500 bg-purple-500/10' : 'border-purple-400 bg-purple-50')
        )}
        onClick={() => document.getElementById(`file-upload-${label.replace(/\s/g, '-')}`)?.click()}
      >
        <input
          id={`file-upload-${label.replace(/\s/g, '-')}`}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          className="hidden"
        />
        <Upload className={cn('w-10 h-10 mx-auto mb-2', textMuted)} />
        <p className={cn('text-sm', textMuted)}>
          Перетащите файлы сюда или нажмите для выбора
        </p>
        <p className={cn('text-xs mt-1', textMuted)}>PDF, JPEG, PNG</p>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${index}`}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                cardBg
              )}
            >
              {isPdf(file) ? (
                <FileText className="h-8 w-8 shrink-0 text-red-500" />
              ) : isImage(file) ? (
                <Image className="h-8 w-8 shrink-0 text-blue-500" />
              ) : (
                <FileText className={cn('h-8 w-8 shrink-0', textMuted)} />
              )}
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium truncate', isDark ? 'text-white' : 'text-gray-900')}>
                  {file.name}
                </p>
                <p className={cn('text-xs', textMuted)}>{formatSize(file.size)}</p>
                {uploadProgress?.fileIndex === index && (
                  <Progress value={uploadProgress.value} className="mt-2 h-1.5" />
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
