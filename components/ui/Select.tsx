'use client';

import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Select({
  value,
  onValueChange,
  options,
  label,
  placeholder = 'Select option',
  className,
  disabled,
}: SelectProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-xs font-medium text-text">{label}</span>}
      <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
        <RadixSelect.Trigger
          className={clsx(
            'inline-flex items-center justify-between h-8 px-3 rounded-DEFAULT bg-surface text-text text-xs font-medium border border-border-control focus:border-accent focus:outline-none hover:bg-surface-hover transition-colors disabled:opacity-50',
            className
          )}
          aria-label={label || placeholder}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon>
            <ChevronDown className="w-3.5 h-3.5 text-text-muted ml-1.5" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
          <RadixSelect.Content className="overflow-hidden bg-surface-raised border border-border rounded-md shadow-md z-50 min-w-[140px]">
            <RadixSelect.Viewport className="p-1 max-h-56 overflow-y-auto">
              {options.map((opt) => (
                <RadixSelect.Item
                  key={opt.value}
                  value={opt.value}
                  className="relative flex items-center h-7 pl-6 pr-3 rounded text-xs font-medium text-text hover:bg-surface-hover select-none outline-none cursor-pointer data-[highlighted]:bg-surface-hover transition-colors"
                >
                  <RadixSelect.ItemText>{opt.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute left-1.5 inline-flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-accent" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>
    </div>
  );
}
