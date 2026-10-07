'use client';

import React from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { clsx } from 'clsx';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string = string> {
  value: T;
  onValueChange: (val: T) => void;
  options: SegmentOption<T>[];
  ariaLabel?: string;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string = string>({
  value,
  onValueChange,
  options,
  ariaLabel = 'Select option',
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <ToggleGroup.Root
      type="single"
      value={value}
      onValueChange={(val) => {
        if (val) onValueChange(val as T);
      }}
      aria-label={ariaLabel}
      className="inline-flex bg-surface-muted p-1 rounded-DEFAULT border border-border"
    >
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <ToggleGroup.Item
            key={opt.value}
            value={opt.value}
            className={clsx(
              'px-3 rounded-DEFAULT text-xs font-medium transition-all select-none focus-visible:outline',
              size === 'sm' ? 'h-7' : 'h-8',
              isSelected
                ? 'bg-accent-tint-strong text-text font-semibold shadow-sm border border-accent/20'
                : 'text-text-muted hover:text-text hover:bg-surface-hover'
            )}
          >
            {opt.label}
          </ToggleGroup.Item>
        );
      })}
    </ToggleGroup.Root>
  );
}
