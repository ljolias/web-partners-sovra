'use client';

import { TipTapEditor } from './TipTapEditor';
import { LocalizedString } from '@/types';
import { useState } from 'react';

interface MultiLangTipTapProps {
  value: LocalizedString;
  onChange: (value: LocalizedString) => void;
  label?: string;
}

export function MultiLangTipTap({ value, onChange, label }: MultiLangTipTapProps) {
  const [activeLanguage, setActiveLanguage] = useState<'es' | 'en' | 'pt'>('es');

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-[var(--color-text-primary)]">
          {label}
        </label>
      )}

      {/* Language tabs */}
      <div className="flex gap-2 border-b border-[var(--color-border)]">
        {(['es', 'en', 'pt'] as const).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => setActiveLanguage(lang)}
            className={`
              px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px
              ${
                activeLanguage === lang
                  ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                  : 'border-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }
            `}
          >
            {lang.toUpperCase()} {lang === 'es' && '*'}
          </button>
        ))}
      </div>

      {/* Editor for active language */}
      <TipTapEditor
        content={value[activeLanguage] || ''}
        onChange={(html) => onChange({ ...value, [activeLanguage]: html })}
        placeholder={`Contenido en ${activeLanguage.toUpperCase()}...`}
      />
    </div>
  );
}
