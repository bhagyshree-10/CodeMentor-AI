'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { Lock, ChevronRight } from 'lucide-react';
import { HintEntry } from '../../schemas/hint';

export interface HintRungProps {
  level: 1 | 2 | 3 | 4;
  title: string;
  currentLevel: number;
  entry?: HintEntry;
  onRevealNext?: () => void;
  isLoading?: boolean;
}

export function HintRung({
  level,
  title,
  currentLevel,
  entry,
  onRevealNext,
  isLoading,
}: HintRungProps) {
  const isRevealed = !!entry;
  const isNextToReveal = !entry && level === currentLevel + 1;
  const isLocked = !entry && level > currentLevel + 1;

  const content = entry?.content as any;

  return (
    <div className="flex gap-4 min-h-[90px] relative">
      {/* Node & vertical connecting line */}
      <div className="flex flex-col items-center">
        <div
          className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all z-10 ${
            isRevealed
              ? 'bg-text text-bg'
              : isNextToReveal
              ? 'bg-bg text-accent border-2 border-accent ring-4 ring-accent/20'
              : 'bg-surface-muted text-text-disabled border border-border'
          }`}
        >
          {level}
        </div>
        {level < 4 && (
          <div
            className={`w-0.5 flex-1 my-1 ${
              level <= currentLevel ? 'bg-text' : 'border-l-2 border-dashed border-border'
            }`}
          />
        )}
      </div>

      {/* Rung Content */}
      <div className="flex-1 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`text-base font-semibold ${isLocked ? 'text-text-disabled' : 'text-text'}`}>
            Level {level}: {title}
          </h3>
          {isLocked && <Lock className="w-3.5 h-3.5 text-text-disabled" />}
        </div>

        {isRevealed && content && (
          <div className="p-4 bg-surface border border-border rounded-DEFAULT border-l-4 border-l-accent flex flex-col gap-3 my-2 animate-fadeIn">
            {level === 1 && (
              <>
                <p className="text-sm text-text font-medium">{content.restatement}</p>
                <div>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Constraints</span>
                  <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
                    {content.constraints?.map((c: string, i: number) => <li key={i}>{c}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">Worked Example</span>
                  <pre className="p-2 bg-bg border border-border text-xs font-mono text-text rounded-sm">{content.workedExample}</pre>
                </div>
              </>
            )}

            {level === 2 && (
              <>
                <p className="text-sm text-text font-medium">{content.observation}</p>
                <div className="p-3 bg-accent-tint border-l-2 border-accent rounded-sm">
                  <span className="text-xs font-semibold text-accent-strong block mb-1">Guiding Question</span>
                  <p className="text-sm text-text italic">{content.guidingQuestion}</p>
                </div>
              </>
            )}

            {level === 3 && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Category:</span>
                  <span className="text-xs font-mono font-bold text-accent-strong px-2 py-0.5 bg-accent-tint rounded-sm">
                    {content.techniqueCategory}
                  </span>
                </div>
                <p className="text-sm text-text">{content.whyItFits}</p>
                <div className="p-3 bg-accent-tint border-l-2 border-accent rounded-sm">
                  <span className="text-xs font-semibold text-accent-strong block mb-1">Guiding Question</span>
                  <p className="text-sm text-text italic">{content.guidingQuestion}</p>
                </div>
              </>
            )}

            {level === 4 && (
              <div>
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-2">Algorithm Outline</span>
                <ol className="list-decimal pl-5 text-sm text-text space-y-2 font-medium">
                  {content.steps?.map((step: string, i: number) => <li key={i}>{step}</li>)}
                </ol>
              </div>
            )}

            <p className="text-[11px] text-text-muted italic mt-1">Take a few minutes with this hint before moving on.</p>
          </div>
        )}

        {isNextToReveal && onRevealNext && (
          <div className="my-2">
            <Button variant="primary" size="md" onClick={onRevealNext} isLoading={isLoading} className="gap-2">
              <span>Reveal hint {level} of 4</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {isLocked && (
          <p className="text-xs text-text-disabled italic">Locked — reveal earlier hints to unlock Level {level}.</p>
        )}
      </div>
    </div>
  );
}
