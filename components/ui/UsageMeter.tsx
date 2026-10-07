import React from 'react';

export interface UsageMeterProps {
  used: number;
  limit: number;
}

export function UsageMeter({ used, limit }: UsageMeterProps) {
  const remaining = Math.max(0, limit - used);
  const isWarning = remaining <= 2;

  return (
    <span className={`text-xs ${isWarning ? 'text-semantic-warning font-semibold' : 'text-text-muted'}`}>
      {remaining} of {limit} left today
    </span>
  );
}
