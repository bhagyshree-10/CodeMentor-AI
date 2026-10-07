'use client';

import React from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { clsx } from 'clsx';

export type WorkspaceMode = 'analyze' | 'hint';

export interface ModeTabsProps {
  value: WorkspaceMode;
  onValueChange: (mode: WorkspaceMode) => void;
}

export function ModeTabs({ value, onValueChange }: ModeTabsProps) {
  return (
    <Tabs.Root value={value} onValueChange={(val) => onValueChange(val as WorkspaceMode)}>
      <Tabs.List className="flex border-b border-border mb-4">
        <Tabs.Trigger
          value="analyze"
          className={clsx(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 focus-visible:outline select-none',
            value === 'analyze'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text'
          )}
        >
          Analyze Code
        </Tabs.Trigger>
        <Tabs.Trigger
          value="hint"
          className={clsx(
            'px-4 py-2 text-sm font-medium transition-colors border-b-2 focus-visible:outline select-none',
            value === 'hint'
              ? 'border-accent text-text font-semibold'
              : 'border-transparent text-text-muted hover:text-text'
          )}
        >
          DSA Hint Ladder
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}
