import React from 'react';
import { Button } from '@/components/ui/button';

export default function LanguageToggle({ language, setLanguage }) {
  return (
    <div className="px-4 py-4 mt-auto border-t border-slate-200/60">
      <div className="flex bg-slate-100 p-1 rounded-lg">
        <Button
          variant={language === 'ko' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 text-xs"
          onClick={() => setLanguage('ko')}
        >
          한국어
        </Button>
        <Button
          variant={language === 'en' ? 'default' : 'ghost'}
          size="sm"
          className="flex-1 text-xs"
          onClick={() => setLanguage('en')}
        >
          English
        </Button>
      </div>
    </div>
  );
}