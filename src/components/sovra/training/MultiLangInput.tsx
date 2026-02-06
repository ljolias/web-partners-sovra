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
}

export function MultiLangInput({
  label,
  value,
  onChange,
  required = false,
  type = 'text',
  placeholder,
  error,
}: MultiLangInputProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--color-text-primary)]">
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Español (principal) */}
      {type === 'text' ? (
        <input
          type="text"
          value={value?.es || ''}
          onChange={(e) => onChange({ ...value, es: e.target.value })}
          placeholder={placeholder?.es || `${label} (ES)`}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      ) : (
        <textarea
          value={value?.es || ''}
          onChange={(e) => onChange({ ...value, es: e.target.value })}
          placeholder={placeholder?.es || `${label} (ES)`}
          rows={3}
          className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
        />
      )}

      {/* Toggle para EN/PT */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-[var(--color-primary)] hover:underline"
      >
        {expanded ? '✕ Ocultar traducciones' : '+ Agregar EN/PT'}
      </button>

      {/* English y Português (expandible) */}
      {expanded && (
        <div className="space-y-2 pl-4 border-l-2 border-[var(--color-border)]">
          {type === 'text' ? (
            <>
              <input
                type="text"
                value={value?.en || ''}
                onChange={(e) => onChange({ ...value, en: e.target.value })}
                placeholder={placeholder?.en || `${label} (EN)`}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
              <input
                type="text"
                value={value?.pt || ''}
                onChange={(e) => onChange({ ...value, pt: e.target.value })}
                placeholder={placeholder?.pt || `${label} (PT)`}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </>
          ) : (
            <>
              <textarea
                value={value?.en || ''}
                onChange={(e) => onChange({ ...value, en: e.target.value })}
                placeholder={placeholder?.en || `${label} (EN)`}
                rows={3}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
              <textarea
                value={value?.pt || ''}
                onChange={(e) => onChange({ ...value, pt: e.target.value })}
                placeholder={placeholder?.pt || `${label} (PT)`}
                rows={3}
                className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-primary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20"
              />
            </>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
