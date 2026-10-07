'use client';

import React from 'react';
import { Select } from '../ui/Select';
import { SUPPORTED_LANGUAGES, LANGUAGE_DISPLAY_NAMES, SupportedLanguage } from '../../lib/constants';

export interface LanguageSelectProps {
  value: SupportedLanguage;
  onChange: (lang: SupportedLanguage) => void;
  isAutoDetected?: boolean;
}

export function LanguageSelect({ value, onChange, isAutoDetected }: LanguageSelectProps) {
  const options = SUPPORTED_LANGUAGES.map((lang) => ({
    value: lang,
    label: LANGUAGE_DISPLAY_NAMES[lang],
  }));

  return (
    <div className="flex items-center gap-2">
      <Select
        value={value}
        onValueChange={(val) => onChange(val as SupportedLanguage)}
        options={options}
        label="Language"
        className="w-44"
      />
      {isAutoDetected && (
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-surface-muted text-text-muted mt-5">
          auto-detected
        </span>
      )}
    </div>
  );
}
