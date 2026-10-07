'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Eye } from 'lucide-react';
import { Issue } from '../../schemas/analysis';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { Button } from '../ui/Button';

export interface IssueRowProps {
  issue: Issue;
  onHighlightLines?: (lineStart: number, lineEnd: number) => void;
}

export function IssueRow({ issue, onHighlightLines }: IssueRowProps) {
  const [expanded, setExpanded] = useState(true);

  const typeBadgeColors = {
    bug: 'bg-semantic-error/10 text-semantic-error border-semantic-error/20',
    'edge-case': 'bg-semantic-warning/10 text-semantic-warning border-semantic-warning/20',
    performance: 'bg-accent-tint text-accent-strong border-accent/20',
  };

  return (
    <div className="border border-border rounded-DEFAULT bg-surface mb-3 overflow-hidden border-l-4 border-l-border-control">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-surface-hover transition-colors focus-visible:outline"
      >
        <div className="flex items-center gap-2.5 flex-wrap">
          {expanded ? <ChevronDown className="w-4 h-4 text-text-muted" /> : <ChevronRight className="w-4 h-4 text-text-muted" />}
          <span className={`text-xs px-2 py-0.5 font-semibold rounded-sm border uppercase tracking-wide ${typeBadgeColors[issue.type]}`}>
            {issue.type}
          </span>
          <span className="text-xs font-mono text-text-muted font-medium">
            Lines {issue.lineStart}–{issue.lineEnd}
          </span>
          <h3 className="text-sm font-semibold text-text">{issue.title}</h3>
        </div>

        <div className="flex items-center gap-3">
          {issue.tag && (
            <span className="text-xs font-mono px-2 py-0.5 rounded-sm bg-surface-muted text-text font-medium">
              {issue.tag}
            </span>
          )}
          <ConfidenceIndicator level={issue.confidence} />
        </div>
      </button>

      {expanded && (
        <div className="p-4 pt-2 border-t border-border flex flex-col gap-3 bg-bg/40">
          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">What is wrong</span>
            <p className="text-sm text-text">{issue.whatIsWrong}</p>
          </div>

          <div>
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Why it happens</span>
            <p className="text-sm text-text-muted">{issue.whyItHappens}</p>
          </div>

          {issue.evidence && (
            <div>
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Evidence / Failing Input</span>
              <pre className="p-3 bg-bg border border-border rounded-DEFAULT font-mono text-xs text-text overflow-x-auto whitespace-pre-wrap">
                {issue.evidence}
              </pre>
            </div>
          )}

          {onHighlightLines && (
            <div className="pt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onHighlightLines(issue.lineStart, issue.lineEnd)}
                className="text-xs text-accent-strong hover:text-accent gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                Highlight lines {issue.lineStart}–{issue.lineEnd} in editor
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
