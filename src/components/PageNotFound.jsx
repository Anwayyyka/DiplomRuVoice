import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-zinc-400 mb-8">Страница не найдена</p>
        <Link to="/">
          <Button>Вернуться на главную</Button>
        </Link>
      </div>
    </div>
  );
}