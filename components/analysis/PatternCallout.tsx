import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { RecurrenceInsight } from '../../services/insight-service';

export interface PatternCalloutProps {
  insight: RecurrenceInsight;
}

export function PatternCallout({ insight }: PatternCalloutProps) {
  return (
    <div
      role="note"
      className="flex items-center gap-3 p-3 my-4 bg-surface-muted border-l-2 border-accent text-sm text-text rounded-sm"
    >
      <AlertTriangle className="w-4 h-4 text-accent shrink-0" />
      <div>
        <span>You&apos;ve hit </span>
        <code className="px-1.5 py-0.5 rounded-sm bg-accent-tint font-mono text-xs font-semibold text-accent-strong">
          {insight.tag}
        </code>
        <span> in {insight.earlierCount} earlier analyses. </span>
        <Link href={insight.href} className="underline text-accent-strong hover:text-accent font-medium ml-1">
          View them in History
        </Link>
      </div>
    </div>
  );
}
