'use client';

import React from 'react';
import { HintRung } from './HintRung';
import { AttemptBox } from './AttemptBox';
import { HintEntry } from '../../schemas/hint';

export interface HintLadderProps {
  problem: string;
  currentLevel: number;
  entries: HintEntry[];
  onRevealNext: () => Promise<void>;
  onSubmitAttempt: (attemptText: string) => Promise<void>;
  isLoading?: boolean;
}

const RUNG_TITLES: Record<number, string> = {
  1: 'Understand the Problem & Constraints',
  2: 'Key Conceptual Observation',
  3: 'Technique & Direction',
  4: 'Algorithm Step-by-Step Outline',
};

export function HintLadder({
  problem,
  currentLevel,
  entries,
  onRevealNext,
  onSubmitAttempt,
  isLoading,
}: HintLadderProps) {
  const getEntryForLevel = (level: number) => {
    return entries.find((e) => e.level === level && e.type === 'hint');
  };

  const feedbackEntries = entries.filter((e) => e.type === 'attempt-feedback');

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto p-6">
      {/* Problem Header */}
      <div className="p-4 bg-bg border border-border rounded-DEFAULT mb-8">
        <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block mb-1">
          DSA Problem Statement
        </span>
        <p className="text-sm text-text font-medium whitespace-pre-wrap">{problem}</p>
      </div>

      {/* Rungs 1 to 4 */}
      <div className="flex flex-col">
        {[1, 2, 3, 4].map((level) => (
          <HintRung
            key={level}
            level={level as 1 | 2 | 3 | 4}
            title={RUNG_TITLES[level]}
            currentLevel={currentLevel}
            entry={getEntryForLevel(level)}
            onRevealNext={level === currentLevel ? onRevealNext : undefined}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* Feedback entries list if user submitted attempts */}
      {feedbackEntries.length > 0 && (
        <div className="mt-6 p-4 bg-surface-muted border border-border rounded-DEFAULT">
          <h4 className="text-xs font-semibold text-text uppercase tracking-wider mb-2">Attempt Feedback History</h4>
          <div className="flex flex-col gap-2">
            {feedbackEntries.map((fb, idx) => {
              const content = fb.content as any;
              return (
                <div key={idx} className="p-2 bg-bg border border-border rounded-sm text-xs">
                  <span className="font-semibold text-accent-strong">Feedback (Level {fb.level}):</span> {content?.feedback}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Attempt Box */}
      <div className="mt-4">
        <AttemptBox onSubmitAttempt={onSubmitAttempt} isLoading={isLoading} />
      </div>
    </div>
  );
}
