'use client';

import React from 'react';
import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 bg-bg/70 backdrop-blur-xs z-50 transition-opacity" />
        <RadixDialog.Content
          className={clsx(
            'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-surface-raised border border-border rounded-lg shadow-xl z-50 focus:outline-none'
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <RadixDialog.Title className="text-lg font-semibold text-text">{title}</RadixDialog.Title>
            <RadixDialog.Close className="text-text-muted hover:text-text rounded-DEFAULT p-1 focus-visible:outline">
              <X className="w-4 h-4" />
            </RadixDialog.Close>
          </div>
          {description && (
            <RadixDialog.Description className="text-sm text-text-muted mb-4">
              {description}
            </RadixDialog.Description>
          )}
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}
