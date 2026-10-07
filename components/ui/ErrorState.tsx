import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 p-4 bg-surface rounded-DEFAULT border-l-2 border-semantic-error border border-border"
    >
      <AlertCircle className="w-5 h-5 text-semantic-error shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-sm font-medium text-text">{message}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3">
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}
