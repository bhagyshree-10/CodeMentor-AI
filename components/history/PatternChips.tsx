'use client';

import React from 'react';
import { clsx } from 'clsx';

export interface TagCount {
  tag: string;
  count: number;
}

export interface PatternChipsProps {
  topTags: TagCount[];
  selectedTag?: string;
  onSelectTag: (tag: string | undefined) => void;
}

export function PatternChips({ topTags, selectedTag, onSelectTag }: PatternChipsProps) {
  if (!topTags || topTags.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 my-4">
      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Top Mistake Patterns</span>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => onSelectTag(undefined)}
          aria-pressed={!selectedTag}
          className={clsx(
            'px-2.5 py-1 rounded-sm text-xs font-mono transition-colors focus-visible:outline',
            !selectedTag
              ? 'bg-accent-tint-strong text-text font-bold border border-accent/20'
              : 'bg-surface-muted text-text-muted hover:text-text'
          )}
        >
          All Tags
        </button>
        {topTags.map(({ tag, count }) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(isSelected ? undefined : tag)}
              aria-pressed={isSelected}
              className={clsx(
                'px-2.5 py-1 rounded-sm text-xs font-mono transition-colors focus-visible:outline flex items-center gap-1.5',
                isSelected
                  ? 'bg-accent-tint-strong text-text font-bold border border-accent/20'
                  : 'bg-surface-muted text-text-muted hover:text-text hover:bg-surface-hover'
              )}
            >
              <span>{tag}</span>
              <span className="px-1 py-0.2 rounded-xs bg-bg text-[10px] font-semibold">{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
