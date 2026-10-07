import React from 'react';

export interface ConfidenceIndicatorProps {
  level: 'low' | 'medium' | 'high';
  className?: string;
}

export function ConfidenceIndicator({ level, className = '' }: ConfidenceIndicatorProps) {
  const dots = {
    high: '● ● ●',
    medium: '● ● ○',
    low: '● ○ ○',
  };

  const label = level.charAt(0).toUpperCase() + level.slice(1);

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs text-text-muted ${className}`}
      title="Confidence reported by the model; not a guarantee"
    >
      <span className="font-mono text-[10px] tracking-wider text-accent">{dots[level]}</span>
      <span className="font-medium">{label} Confidence</span>
    </span>
  );
}
