'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? `input_${label.toLowerCase().replace(/\s+/g, '_')}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={inputId} className="text-xs font-medium text-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}_error` : helperText ? `${inputId}_helper` : undefined}
          className={twMerge(
            clsx(
              'h-10 px-3 rounded-DEFAULT bg-bg text-text text-sm border border-border-control focus:border-accent focus:outline-none transition-colors disabled:opacity-50',
              error && 'border-semantic-error',
              className
            )
          )}
          {...props}
        />
        {error ? (
          <span id={`${inputId}_error`} className="text-xs text-semantic-error">
            {error}
          </span>
        ) : helperText ? (
          <span id={`${inputId}_helper`} className="text-xs text-text-muted">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const areaId = id || (label ? `area_${label.toLowerCase().replace(/\s+/g, '_')}` : undefined);

    return (
      <div className="w-full flex flex-col gap-1">
        {label && (
          <label htmlFor={areaId} className="text-xs font-medium text-text">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          aria-invalid={!!error}
          aria-describedby={error ? `${areaId}_error` : helperText ? `${areaId}_helper` : undefined}
          className={twMerge(
            clsx(
              'p-3 rounded-DEFAULT bg-bg text-text text-sm border border-border-control focus:border-accent focus:outline-none transition-colors disabled:opacity-50 font-mono resize-y',
              error && 'border-semantic-error',
              className
            )
          )}
          {...props}
        />
        {error ? (
          <span id={`${areaId}_error`} className="text-xs text-semantic-error">
            {error}
          </span>
        ) : helperText ? (
          <span id={`${areaId}_helper`} className="text-xs text-text-muted">
            {helperText}
          </span>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
