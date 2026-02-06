'use client';

import { LocalizedString } from '@/types';
import { useState } from 'react';

interface MultiLangInputProps {
  label: string;
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  required?: boolean;
  type?: 'text' | 'textarea';
  placeholder?: LocalizedString;
  error?: string;
  currentLocale?: 'es' | 'en' | 'pt';
}

const languageNames: Record<'es' | 'en' | 'pt', string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
};

export function MultiLangInput({
  label,
  value,
  onChange,
  required = false,
  type = 'text',
  placeholder,
  error,
  currentLocale = 'es',
}: MultiLangInputProps) {
  const [expanded, setExpanded] = useState(false);

  // Get the other languages (not the current one)
  const otherLanguages = (['es', 'en', 'pt'] as const).filter(lang => lang !== currentLocale);

  const getPlaceholderForLang = (lang: 'es' | 'en' | 'pt') => {
    if (placeholder?.[lang]) return placeholder[lang];
    return `${label} (${lang.toUpperCase()})`;
  };

  const handleChange = (lang: 'es' | 'en' | 'pt', newValue: string) => {
    onChange({ ...value, [lang]: newValue });
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--color-text-primary)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Main language field (current locale) */}
      <div className="space-y-1">
        <div className="text-xs text-[var(--color-text-secondary)] px-1">
          {languageNames[currentLocale]} {currentLocale === 'es' && '*'}
        </div>
        {type === 'text' ? (
          <input
            type="text"
            value={value?.[currentLocale] || ''}
            onChange={(e) => handleChange(currentLocale, e.target.value)}
            placeholder={getPlaceholderForLang(currentLocale)}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        ) : (
          <textarea
            value={value?.[currentLocale] || ''}
            onChange={(e) => handleChange(currentLocale, e.target.value)}
            placeholder={getPlaceholderForLang(currentLocale)}
            rows={3}
            className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
          />
        )}
      </div>

      {/* Toggle para otros idiomas */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-[var(--color-primary)] hover:underline"
      >
        {expanded ? '✕ Ocultar' : '+ Agregar'} {otherLanguages.map(l => languageNames[l]).join('/')}
      </button>

      {/* Other languages (expandible) */}
      {expanded && (
        <div className="space-y-2 pl-4 border-l-2 border-[var(--color-border)]">
          {otherLanguages.map(lang => (
            <div key={lang} className="space-y-1">
              <div className="text-xs text-[var(--color-text-secondary)] px-1">
                {languageNames[lang]}
              </div>
              {type === 'text' ? (
                <input
                  type="text"
                  value={value?.[lang] || ''}
                  onChange={(e) => handleChange(lang, e.target.value)}
                  placeholder={getPlaceholderForLang(lang)}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              ) : (
                <textarea
                  value={value?.[lang] || ''}
                  onChange={(e) => handleChange(lang, e.target.value)}
                  placeholder={getPlaceholderForLang(lang)}
                  rows={3}
                  className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
