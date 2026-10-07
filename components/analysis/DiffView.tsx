'use client';

import React, { useState } from 'react';
import * as diff from 'diff';
import { Button } from '../ui/Button';

export interface DiffViewProps {
  originalCode: string;
  improvedCode: string;
}

export function DiffView({ originalCode, improvedCode }: DiffViewProps) {
  const [viewMode, setViewMode] = useState<'diff' | 'improved'>('diff');

  const diffChanges = React.useMemo(() => {
    if (!originalCode || !improvedCode) return [];
    return diff.diffLines(originalCode, improvedCode);
  }, [originalCode, improvedCode]);

  return (
    <div className="flex flex-col gap-3 my-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-text uppercase tracking-wider">Improved Solution</span>
        <div className="flex items-center gap-1 bg-surface-muted p-0.5 rounded-DEFAULT border border-border">
          <Button
            type="button"
            variant={viewMode === 'diff' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('diff')}
            className="h-7 text-xs"
          >
            Line Diff
          </Button>
          <Button
            type="button"
            variant={viewMode === 'improved' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('improved')}
            className="h-7 text-xs"
          >
            Improved Only
          </Button>
        </div>
      </div>

      <div className="font-mono text-xs overflow-x-auto rounded-DEFAULT border border-border bg-bg p-3 leading-relaxed">
        {viewMode === 'improved' ? (
          <pre className="text-text whitespace-pre-wrap">{improvedCode}</pre>
        ) : (
          <div className="flex flex-col">
            {diffChanges.map((change, idx) => {
              const lines = change.value.replace(/\n$/, '').split('\n');
              return lines.map((line, lineIdx) => {
                let bgColor = 'bg-transparent text-text';
                let symbol = ' ';

                if (change.added) {
                  bgColor = 'bg-accent-tint text-text font-medium';
                  symbol = '+';
                } else if (change.removed) {
                  bgColor = 'bg-surface-muted text-text-muted line-through opacity-70';
                  symbol = '-';
                }

                return (
                  <div key={`${idx}_${lineIdx}`} className={`flex items-start px-2 py-0.5 rounded-xs ${bgColor}`}>
                    <span className="w-5 shrink-0 select-none text-text-muted font-bold">{symbol}</span>
                    <span className="whitespace-pre-wrap flex-1">{line || ' '}</span>
                  </div>
                );
              });
            })}
          </div>
        )}
      </div>
    </div>
  );
}
