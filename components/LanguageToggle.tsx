 'use client';
import type { Lang } from './types';

export function LanguageToggle({ lang, setLang, tone = 'dark' }: { lang: Lang; setLang: (lang: Lang) => void; tone?: 'dark' | 'light' }) {
  return (
    <div className={`language-toggle ${tone === 'light' ? 'language-toggle--light' : ''}`} aria-label="Language selector">
      {(['sv', 'en'] as Lang[]).map((code) => (
        <button key={code} type="button" aria-pressed={lang === code} onClick={() => setLang(code)}>
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
