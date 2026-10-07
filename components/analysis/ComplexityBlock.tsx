import React from 'react';
import { ComplexitySchema } from '../../schemas/analysis';
import { z } from 'zod';
import { ConfidenceIndicator } from './ConfidenceIndicator';

export interface ComplexityBlockProps {
  complexity: z.infer<typeof ComplexitySchema>;
}

export function ComplexityBlock({ complexity }: ComplexityBlockProps) {
  return (
    <div className="p-4 rounded-DEFAULT border border-border bg-surface my-4">
      <div className="flex items-center justify-between mb-3 border-b border-border pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Complexity Comparison</span>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-sm bg-surface-muted text-text-muted">
          AI-estimated
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
        <div className="p-3 bg-bg border border-border rounded-DEFAULT">
          <span className="text-xs font-semibold text-text-muted block mb-1">Original Code</span>
          <div className="flex gap-4 text-sm font-mono font-medium text-text">
            <div>Time: <span className="text-accent-strong">{complexity.original.time}</span></div>
            <div>Space: <span className="text-accent-strong">{complexity.original.space}</span></div>
          </div>
        </div>

        {complexity.improved ? (
          <div className="p-3 bg-accent-tint border border-accent/20 rounded-DEFAULT">
            <span className="text-xs font-semibold text-accent-strong block mb-1">Improved Solution</span>
            <div className="flex gap-4 text-sm font-mono font-bold text-text">
              <div>Time: <span className="text-accent-strong">{complexity.improved.time}</span></div>
              <div>Space: <span className="text-accent-strong">{complexity.improved.space}</span></div>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-bg border border-border rounded-DEFAULT flex items-center justify-center text-xs text-text-muted">
            No complexity change needed
          </div>
        )}
      </div>

      <div className="text-sm text-text-muted pt-2 border-t border-border/50">
        <p className="mb-2">{complexity.reasoning}</p>
        <ConfidenceIndicator level={complexity.confidence} />
      </div>
    </div>
  );
}
