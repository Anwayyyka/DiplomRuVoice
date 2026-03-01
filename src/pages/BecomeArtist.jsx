import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import Stepper from '@/components/shared/Stepper';
import FileUploader from '@/components/shared/FileUploader';
import { COUNTRIES } from '@/mocks/countries';
import { AGREEMENT_TEXT } from '@/mocks/agreementText';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { User, FileUp, Share2, FileCheck, CheckCircle } from 'lucide-react';

const STEPS = [
  { label: 'Данные' },
  { label: 'Документы' },
  { label: 'Соцсети' },
  { label: 'Соглашение' },
];

const MAX_BIO_LENGTH = 500;

export default function BecomeArtist({ isDark: isDarkProp }) {
  const { isDark: isDarkContext } = useTheme();
  const isDark = isDarkProp ?? isDarkContext ?? true;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [agreementAccepted, setAgreementAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    artistName: '',
    fullName: '',
    country: '',
    city: '',
    phone: '',
    documents: [],
    telegram: '',
    vk: '',
    youtube: '',
    website: '',
    bio: '',
  });

  const textClass = isDark ? 'text-white' : 'text-gray-900';
  const textSecondary = isDark ? 'text-zinc-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-zinc-900/80 border-zinc-700' : 'bg-white/80 border-gray-200';
  const labelClass = isDark ? 'text-zinc-300' : 'text-gray-700';
  const inputClass = isDark
    ? 'bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400';

  const handleNext = () => {
    setError(null);
    if (step < 3) setStep((s) => s + 1);
  };

  const handleBack = () => {
    setError(null);
    if (step > 0) setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (!agreementAccepted) {
      setError('Необходимо принять условия соглашения');
      return;
    }
    setLoading(true);
    setError(null);
    // Имитация отправки
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setStep(4);
    }, 1200);
  };

  const handleDocumentsChange = (files) => {
    setFormData((prev) => ({ ...prev, documents: files }));
  };

  // Шаг 5: Успех (после отправки)
  if (submitted && step === 4) {
    return (
      <div className="relative min-h-screen p-4 py-12">
        <div className="max-w-lg mx-auto">
          <Card className={cn('text-center', cardBg)}>
            <CardContent className="pt-8 pb-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
              <h2 className={cn('text-xl font-semibold mb-2', textClass)}>
                Заявка отправлена на модерацию
              </h2>
              <p className={textSecondary}>
                Мы проверим данные и свяжемся с вами. Обычно это занимает до 3 рабочих дней.
              </p>
              <Button asChild className="mt-6">
                <Link to="/">Перейти на главную</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen p-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className={cn('text-2xl sm:text-3xl font-bold mb-6', textClass)}>
          Стать артистом
        </h1>

        <Stepper currentStep={step} steps={STEPS} isDark={isDark} />

        <Card className={cn('mt-8', cardBg)}>
          <CardHeader>
            <CardTitle className={cn('flex items-center gap-2', textClass)}>
              {step === 0 && <><User className="w-5 h-5" /> Личные данные</>}
              {step === 1 && <><FileUp className="w-5 h-5" /> Загрузка документов</>}
              {step === 2 && <><Share2 className="w-5 h-5" /> Социальные сети и био</>}
              {step === 3 && <><FileCheck className="w-5 h-5" /> Соглашение</>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-red-500 bg-red-500/10 rounded-lg p-2">{error}</p>
            )}

            {/* Шаг 1: Личные данные */}
            {step === 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="artistName" className={labelClass}>Имя артиста *</Label>
                  <Input
                    id="artistName"
                    value={formData.artistName}
                    onChange={(e) => setFormData({ ...formData, artistName: e.target.value })}
                    placeholder="Сценическое имя"
                    className={inputClass}
                    required
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="fullName" className={labelClass}>Полное имя (опционально)</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Имя и фамилия"
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label className={labelClass}>Страна</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(v) => setFormData({ ...formData, country: v })}
                  >
                    <SelectTrigger className={inputClass}>
                      <SelectValue placeholder="Выберите страну" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className={labelClass}>Город</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Город"
                    className={inputClass}
                  />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="phone" className={labelClass}>Телефон</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+7 (999) 123-45-67"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Шаг 2: Документы */}
            {step === 1 && (
              <div className="space-y-4">
                <p className={cn('text-sm', textSecondary)}>
                  Загрузите сканы/фото документов (PDF, JPEG, PNG). Паспорт — основной разворот. Договор — по желанию.
                </p>
                <FileUploader
                  accept=".pdf,image/jpeg,image/png"
                  multiple
                  onChange={handleDocumentsChange}
                  isDark={isDark}
                  label="Документы"
                />
              </div>
            )}

            {/* Шаг 3: Соцсети и био */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="telegram" className={labelClass}>Telegram</Label>
                  <Input
                    id="telegram"
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    placeholder="https://t.me/..."
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vk" className={labelClass}>VK</Label>
                  <Input
                    id="vk"
                    value={formData.vk}
                    onChange={(e) => setFormData({ ...formData, vk: e.target.value })}
                    placeholder="https://vk.com/..."
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube" className={labelClass}>YouTube</Label>
                  <Input
                    id="youtube"
                    value={formData.youtube}
                    onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website" className={labelClass}>Сайт</Label>
                  <Input
                    id="website"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://..."
                    className={inputClass}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio" className={labelClass}>
                    Биография (макс. {MAX_BIO_LENGTH} символов)
                  </Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value.slice(0, MAX_BIO_LENGTH) })
                    }
                    placeholder="Кратко о себе и творчестве..."
                    className={cn(inputClass, 'min-h-[120px]')}
                    maxLength={MAX_BIO_LENGTH}
                  />
                  <p className={cn('text-xs', textSecondary)}>
                    {formData.bio.length} / {MAX_BIO_LENGTH}
                  </p>
                </div>
              </div>
            )}

            {/* Шаг 4: Соглашение */}
            {step === 3 && (
              <div className="space-y-4">
                <ScrollArea className={cn('h-[200px] rounded-md border p-4', isDark ? 'border-zinc-700 bg-zinc-800/50' : 'border-gray-200 bg-gray-50')}>
                  <p className={cn('text-sm whitespace-pre-wrap', textSecondary)}>
                    {AGREEMENT_TEXT}
                  </p>
                </ScrollArea>
                <a
                  href="#"
                  className={cn('text-sm underline', isDark ? 'text-purple-400' : 'text-purple-600')}
                  onClick={(e) => e.preventDefault()}
                >
                  Скачать соглашение (PDF)
                </a>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="agreement"
                    checked={agreementAccepted}
                    onCheckedChange={(v) => setAgreementAccepted(!!v)}
                  />
                  <Label htmlFor="agreement" className={cn('text-sm cursor-pointer', labelClass)}>
                    Я принимаю условия соглашения *
                  </Label>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={step === 0}
              >
                Назад
              </Button>
              {step < 3 ? (
                <Button onClick={handleNext}>Далее</Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Отправка...' : 'Отправить заявку'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
