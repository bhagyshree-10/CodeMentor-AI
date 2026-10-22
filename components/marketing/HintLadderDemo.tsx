'use client';

import React, { useState } from 'react';
import { HintLadder } from '../hint/HintLadder';
import { HintEntry } from '../../schemas/hint';

export function HintLadderDemo() {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [entries, setEntries] = useState<HintEntry[]>([]);

  const handleReveal = async () => {
    if (currentLevel >= 4) return;
    const nextLvl = (currentLevel + 1) as 1 | 2 | 3 | 4;

    const mockContent: Record<number, any> = {
      1: {
        restatement: 'Given an array of integers and a target sum, return the indices of two numbers that add up to the target.',
        constraints: ['Array length 2..10^4', 'Exactly one valid solution exists'],
        clarifyingQuestions: ['Is array sorted?', 'Can the same element be used twice?'],
        workedExample: 'nums = [2, 7, 11], target = 9 -> [0, 1]',
        edgeCasesToConsider: ['Empty or 1-element array', 'Negative target'],
      },
      2: {
        observation: 'For any number x in the array, you are looking for target - x.',
        guidingQuestion: 'How can you keep track of numbers you have already seen?',
      },
      3: {
        techniqueCategory: 'Keyed lookup structure',
        whyItFits: 'Storing visited numbers in a hash map allows instant complement checks.',
        guidingQuestion: 'Which data structure allows O(1) key lookups?',
      },
      4: {
        steps: [
          'Initialize an empty hash map (value -> index).',
          'Iterate through the array with index i.',
          'Calculate complement = target - nums[i].',
          'If complement is in map, return [map[complement], i].',
          'Store map[nums[i]] = i.',
        ],
      },
    };

    const newEntry: HintEntry = {
      level: nextLvl,
      type: 'hint',
      content: mockContent[nextLvl],
      createdAt: new Date(),
    };

    setEntries((prev) => [...prev, newEntry]);
    setCurrentLevel(nextLvl);
  };

  const handleAttempt = async (text: string) => {
    setEntries((prev) => [
      ...prev,
      {
        level: currentLevel,
        type: 'attempt-feedback',
        content: {
          feedback: `Good attempt! Consider using a hash map to reduce time complexity.`,
          guidingQuestion: 'What is the time complexity of your inner loop?',
        },
        attemptText: text,
        createdAt: new Date(),
      },
    ]);
  };

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto border-t border-border">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">Interactive DSA Hint Ladder Demo</h2>
        <p className="text-sm text-text-muted">Try revealing hints one by one below. We withhold the solution until you work for it.</p>
      </div>

      <div className="border border-border rounded-lg bg-surface shadow-md">
        <HintLadder
          problem="Two Sum: Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target."
          currentLevel={currentLevel}
          entries={entries}
          onRevealNext={handleReveal}
          onSubmitAttempt={handleAttempt}
        />
      </div>
    </section>
  );
}
