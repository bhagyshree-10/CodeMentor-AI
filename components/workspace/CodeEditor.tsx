'use client';

import React, { useMemo, useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { java } from '@codemirror/lang-java';
import { cpp } from '@codemirror/lang-cpp';
import { EditorView } from '@codemirror/view';
import { oneDark } from '@codemirror/theme-one-dark';
import { SupportedLanguage } from '../../lib/constants';

export interface CodeEditorProps {
  value: string;
  onChange?: (val: string) => void;
  language: SupportedLanguage;
  readOnly?: boolean;
  highlightLines?: { start: number; end: number } | null;
  placeholder?: string;
}

// Custom light theme to match CodeMentor AI light palette with strong text contrast
const lightTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--surface, #F5F7F7)',
    color: 'var(--text, #12343B)',
  },
  '.cm-content': {
    caretColor: 'var(--accent-strong, #106D70)',
    fontFamily: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  '.cm-cursor, .cm-dropCursor': { stroke: 'var(--accent-strong, #106D70)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: 'var(--accent-tint, #DEECEC)',
  },
  '.cm-gutters': {
    backgroundColor: 'var(--surface-muted, #E1E5E6)',
    color: 'var(--text-muted, #4D676C)',
    borderRight: '1px solid var(--border, #D1D8D9)',
  },
  '.cm-activeLine': { backgroundColor: 'var(--surface-hover, #EAEDEE)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--surface-hover, #EAEDEE)', color: 'var(--text, #12343B)' },
  '.cm-placeholder': { color: 'var(--text-disabled, #849699)' },
});

// Custom dark theme tweaks to blend OneDark with CodeMentor dark palette
const darkThemeOverrides = EditorView.theme({
  '&': {
    backgroundColor: 'var(--surface, #162426) !important',
    color: 'var(--text, #E8F1F2) !important',
  },
  '.cm-gutters': {
    backgroundColor: '#121e20 !important',
    color: 'var(--text-muted, #A6B1B2) !important',
    borderRight: '1px solid var(--border, #344244) !important',
  },
  '.cm-activeLine': { backgroundColor: 'var(--surface-hover, #1F2C2F) !important' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--surface-hover, #1F2C2F) !important', color: 'var(--text, #E8F1F2) !important' },
  '.cm-placeholder': { color: 'var(--text-disabled, #7A8688) !important' },
});

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  placeholder = '// Paste or write your code here...\n',
}: CodeEditorProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const updateTheme = () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      setIsDark(currentTheme === 'dark');
    };

    updateTheme();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'data-theme') {
          updateTheme();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  const extensions = useMemo(() => {
    const exts = [];
    if (language === 'python') exts.push(python());
    if (language === 'javascript' || language === 'typescript')
      exts.push(javascript({ typescript: language === 'typescript' }));
    if (language === 'java') exts.push(java());
    if (language === 'c' || language === 'cpp') exts.push(cpp());

    if (isDark) {
      exts.push(oneDark);
      exts.push(darkThemeOverrides);
    } else {
      exts.push(lightTheme);
    }

    return exts;
  }, [language, isDark]);

  return (
    <div className="relative w-full h-full min-h-[360px] border border-border rounded-DEFAULT overflow-hidden bg-surface text-text">
      <CodeMirror
        value={value}
        height="100%"
        minHeight="360px"
        extensions={extensions}
        onChange={onChange}
        readOnly={readOnly}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: !readOnly,
          foldGutter: false,
          dropCursor: true,
          allowMultipleSelections: false,
          indentOnInput: true,
        }}
        className="text-sm font-mono h-full"
      />
    </div>
  );
}
