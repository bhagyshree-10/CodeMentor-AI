'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-DEFAULT transition-colors focus-visible:outline disabled:opacity-50 disabled:cursor-not-allowed select-none';

    const variants = {
      primary: 'bg-accent-strong text-on-accent hover:bg-accent-hover active:bg-accent-hover',
      secondary:
        'bg-surface text-text border border-border-control hover:bg-surface-hover active:bg-surface-muted',
      ghost: 'bg-transparent text-text hover:bg-surface-hover active:bg-surface-muted',
      danger:
        'bg-surface text-semantic-error border border-semantic-error hover:bg-surface-hover active:bg-semantic-error active:text-on-accent',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
