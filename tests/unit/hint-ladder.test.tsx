import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HintLadder } from '../../components/hint/HintLadder';
import { HintEntry } from '../../schemas/hint';
import { createInitialHintState, advanceHintLevel } from '../../services/ai/hint-state';

const mockLevel1Content = {
  restatement: 'Find the target index in sorted array.',
  constraints: ['Array is sorted', 'Length up to 10^5'],
  clarifyingQuestions: ['Are values unique?'],
  workedExample: 'arr = [1, 3, 5], target = 3 -> index 1',
  edgeCasesToConsider: ['Target not present', 'Empty array'],
};

const mockLevel2Content = {
  observation: 'The array elements are in ascending order, so checking mid eliminates half.',
  guidingQuestion: 'Which half can be discarded if target < arr[mid]?',
};

const mockLevel3Content = {
  techniqueCategory: 'Binary Search',
  whyItFits: 'Monotonic property allows O(log n) search time.',
  guidingQuestion: 'How should you update low and high pointers?',
};

const mockLevel4Content = {
  steps: [
    'Initialize low = 0 and high = len(arr) - 1',
    'While low <= high, compute mid = (low + high) // 2',
    'If arr[mid] == target return mid',
    'If arr[mid] < target set low = mid + 1, else high = mid - 1',
    'Return -1 if target not found',
  ],
};

describe('Hint Ladder Sequential Reveal Flow', () => {
  it('initial state: Levels 1-4 are unrevealed, shows only "Reveal hint 1 of 4", no hint content visible', () => {
    render(
      <HintLadder
        problem="Binary Search problem statement"
        currentLevel={0}
        entries={[]}
        onRevealNext={vi.fn()}
        onSubmitAttempt={vi.fn()}
      />
    );

    // Initial button must be "Reveal hint 1 of 4"
    const revealBtn = screen.getByRole('button', { name: /reveal hint 1 of 4/i });
    expect(revealBtn).toBeDefined();

    // No other reveal buttons should exist
    expect(screen.queryByRole('button', { name: /reveal hint 2 of 4/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /reveal hint 3 of 4/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /reveal hint 4 of 4/i })).toBeNull();

    // No hint content should be visible
    expect(screen.queryByText('Find the target index in sorted array.')).toBeNull();
    expect(screen.queryByText(/monotonic property/i)).toBeNull();

    // Later levels 2, 3, 4 must be locked
    expect(screen.getByText('Locked — reveal earlier hints to unlock Level 2.')).toBeDefined();
    expect(screen.getByText('Locked — reveal earlier hints to unlock Level 3.')).toBeDefined();
    expect(screen.getByText('Locked — reveal earlier hints to unlock Level 4.')).toBeDefined();
  });

  it('first click: reveals Level 1 only and displays "Reveal hint 2 of 4"', () => {
    const level1Entry: HintEntry = {
      level: 1,
      type: 'hint',
      content: mockLevel1Content,
      createdAt: new Date(),
    };

    render(
      <HintLadder
        problem="Binary Search problem statement"
        currentLevel={1}
        entries={[level1Entry]}
        onRevealNext={vi.fn()}
        onSubmitAttempt={vi.fn()}
      />
    );

    // Level 1 content is visible
    expect(screen.getByText('Find the target index in sorted array.')).toBeDefined();
    expect(screen.getByText('Array is sorted')).toBeDefined();

    // Button updates to "Reveal hint 2 of 4"
    expect(screen.getByRole('button', { name: /reveal hint 2 of 4/i })).toBeDefined();
    expect(screen.queryByRole('button', { name: /reveal hint 1 of 4/i })).toBeNull();

    // Levels 3 and 4 remain locked
    expect(screen.getByText('Locked — reveal earlier hints to unlock Level 3.')).toBeDefined();
    expect(screen.getByText('Locked — reveal earlier hints to unlock Level 4.')).toBeDefined();
  });

  it('second click: reveals Level 2 only and displays "Reveal hint 3 of 4" (Level 2 cannot be skipped)', () => {
    const entries: HintEntry[] = [
      { level: 1, type: 'hint', content: mockLevel1Content, createdAt: new Date() },
      { level: 2, type: 'hint', content: mockLevel2Content, createdAt: new Date() },
    ];

    render(
      <HintLadder
        problem="Binary Search problem statement"
        currentLevel={2}
        entries={entries}
        onRevealNext={vi.fn()}
        onSubmitAttempt={vi.fn()}
      />
    );

    // Both Level 1 and Level 2 are visible
    expect(screen.getByText('Find the target index in sorted array.')).toBeDefined();
    expect(screen.getByText(/The array elements are in ascending order/i)).toBeDefined();

    // Next button is "Reveal hint 3 of 4"
    expect(screen.getByRole('button', { name: /reveal hint 3 of 4/i })).toBeDefined();
    expect(screen.queryByRole('button', { name: /reveal hint 2 of 4/i })).toBeNull();

    // Level 4 remains locked
    expect(screen.getByText('Locked — reveal earlier hints to unlock Level 4.')).toBeDefined();
  });

  it('third click: reveals Level 3 only and displays "Reveal hint 4 of 4"', () => {
    const entries: HintEntry[] = [
      { level: 1, type: 'hint', content: mockLevel1Content, createdAt: new Date() },
      { level: 2, type: 'hint', content: mockLevel2Content, createdAt: new Date() },
      { level: 3, type: 'hint', content: mockLevel3Content, createdAt: new Date() },
    ];

    render(
      <HintLadder
        problem="Binary Search problem statement"
        currentLevel={3}
        entries={entries}
        onRevealNext={vi.fn()}
        onSubmitAttempt={vi.fn()}
      />
    );

    // Levels 1, 2, 3 visible
    expect(screen.getByText('Find the target index in sorted array.')).toBeDefined();
    expect(screen.getByText(/The array elements are in ascending order/i)).toBeDefined();
    expect(screen.getByText('Binary Search')).toBeDefined();

    // Button updates to "Reveal hint 4 of 4"
    expect(screen.getByRole('button', { name: /reveal hint 4 of 4/i })).toBeDefined();
    expect(screen.queryByRole('button', { name: /reveal hint 3 of 4/i })).toBeNull();
  });

  it('fourth click: reveals Level 4, hides reveal button and shows "All hints revealed"', () => {
    const entries: HintEntry[] = [
      { level: 1, type: 'hint', content: mockLevel1Content, createdAt: new Date() },
      { level: 2, type: 'hint', content: mockLevel2Content, createdAt: new Date() },
      { level: 3, type: 'hint', content: mockLevel3Content, createdAt: new Date() },
      { level: 4, type: 'hint', content: mockLevel4Content, createdAt: new Date() },
    ];

    render(
      <HintLadder
        problem="Binary Search problem statement"
        currentLevel={4}
        entries={entries}
        onRevealNext={vi.fn()}
        onSubmitAttempt={vi.fn()}
      />
    );

    // All levels visible
    expect(screen.getByText('Find the target index in sorted array.')).toBeDefined();
    expect(screen.getByText(/The array elements are in ascending order/i)).toBeDefined();
    expect(screen.getByText('Binary Search')).toBeDefined();
    expect(screen.getByText(/While low <= high, compute mid/i)).toBeDefined();

    // No reveal button remains
    expect(screen.queryByRole('button', { name: /reveal hint/i })).toBeNull();

    // All hints revealed completion status is displayed
    expect(screen.getByText('All hints revealed')).toBeDefined();
  });

  it('interactive simulated flow: step-by-step clicks reveal 1, 2, 3, 4 strictly sequentially', () => {
    function InteractiveTestComponent() {
      const [currentLevel, setCurrentLevel] = useState(0);
      const [entries, setEntries] = useState<HintEntry[]>([]);

      const handleRevealNext = async () => {
        const nextLevel = (currentLevel + 1) as 1 | 2 | 3 | 4;
        const contents = [null, mockLevel1Content, mockLevel2Content, mockLevel3Content, mockLevel4Content];
        const newEntry: HintEntry = {
          level: nextLevel,
          type: 'hint',
          content: contents[nextLevel] as any,
          createdAt: new Date(),
        };
        setEntries((prev) => [...prev, newEntry]);
        setCurrentLevel(nextLevel);
      };

      return (
        <HintLadder
          problem="Test problem"
          currentLevel={currentLevel}
          entries={entries}
          onRevealNext={handleRevealNext}
          onSubmitAttempt={vi.fn()}
        />
      );
    }

    render(<InteractiveTestComponent />);

    // Step 0: Initial
    expect(screen.getByRole('button', { name: /reveal hint 1 of 4/i })).toBeDefined();

    // Step 1: Click 1 -> Reveals Level 1
    fireEvent.click(screen.getByRole('button', { name: /reveal hint 1 of 4/i }));
    expect(screen.getByText('Find the target index in sorted array.')).toBeDefined();
    expect(screen.getByRole('button', { name: /reveal hint 2 of 4/i })).toBeDefined();

    // Step 2: Click 2 -> Reveals Level 2
    fireEvent.click(screen.getByRole('button', { name: /reveal hint 2 of 4/i }));
    expect(screen.getByText(/The array elements are in ascending order/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /reveal hint 3 of 4/i })).toBeDefined();

    // Step 3: Click 3 -> Reveals Level 3
    fireEvent.click(screen.getByRole('button', { name: /reveal hint 3 of 4/i }));
    expect(screen.getByText('Binary Search')).toBeDefined();
    expect(screen.getByRole('button', { name: /reveal hint 4 of 4/i })).toBeDefined();

    // Step 4: Click 4 -> Reveals Level 4
    fireEvent.click(screen.getByRole('button', { name: /reveal hint 4 of 4/i }));
    expect(screen.getByText(/While low <= high, compute mid/i)).toBeDefined();
    expect(screen.queryByRole('button', { name: /reveal hint/i })).toBeNull();
    expect(screen.getByText('All hints revealed')).toBeDefined();
  });

  it('starting a new session resets the sequence to level 0', () => {
    function ResettableTestComponent() {
      const [currentLevel, setCurrentLevel] = useState(3);
      const [entries, setEntries] = useState<HintEntry[]>([
        { level: 1, type: 'hint', content: mockLevel1Content, createdAt: new Date() },
        { level: 2, type: 'hint', content: mockLevel2Content, createdAt: new Date() },
        { level: 3, type: 'hint', content: mockLevel3Content, createdAt: new Date() },
      ]);

      const resetSession = () => {
        setCurrentLevel(0);
        setEntries([]);
      };

      return (
        <div>
          <button onClick={resetSession}>Start New Session</button>
          <HintLadder
            problem="Problem"
            currentLevel={currentLevel}
            entries={entries}
            onRevealNext={vi.fn()}
            onSubmitAttempt={vi.fn()}
          />
        </div>
      );
    }

    render(<ResettableTestComponent />);

    // Before reset: Level 3 is revealed, shows "Reveal hint 4 of 4"
    expect(screen.getByRole('button', { name: /reveal hint 4 of 4/i })).toBeDefined();

    // Click Start New Session
    fireEvent.click(screen.getByText('Start New Session'));

    // After reset: Sequence is back to initial state
    expect(screen.getByRole('button', { name: /reveal hint 1 of 4/i })).toBeDefined();
    expect(screen.queryByRole('button', { name: /reveal hint 4 of 4/i })).toBeNull();
    expect(screen.queryByText('Find the target index in sorted array.')).toBeNull();
  });
});

describe('Hint State Machine Unit Logic', () => {
  it('createInitialHintState creates state with currentLevel 0 and empty entries', () => {
    const state = createInitialHintState('Test Problem');
    expect(state.currentLevel).toBe(0);
    expect(state.status).toBe('active');
    expect(state.entries).toEqual([]);
  });

  it('advanceHintLevel advances sequentially from 0 -> 1 -> 2 -> 3 -> 4', () => {
    let state = createInitialHintState('Test Problem');

    const entry1: HintEntry = { level: 1, type: 'hint', content: mockLevel1Content, createdAt: new Date() };
    state = advanceHintLevel(state, entry1);
    expect(state.currentLevel).toBe(1);
    expect(state.status).toBe('active');

    const entry2: HintEntry = { level: 2, type: 'hint', content: mockLevel2Content, createdAt: new Date() };
    state = advanceHintLevel(state, entry2);
    expect(state.currentLevel).toBe(2);
    expect(state.status).toBe('active');

    const entry3: HintEntry = { level: 3, type: 'hint', content: mockLevel3Content, createdAt: new Date() };
    state = advanceHintLevel(state, entry3);
    expect(state.currentLevel).toBe(3);
    expect(state.status).toBe('active');

    const entry4: HintEntry = { level: 4, type: 'hint', content: mockLevel4Content, createdAt: new Date() };
    state = advanceHintLevel(state, entry4);
    expect(state.currentLevel).toBe(4);
    expect(state.status).toBe('completed');

    // Attempting to advance beyond level 4 throws HINT_LIMIT_REACHED
    expect(() => advanceHintLevel(state, entry4)).toThrow("You've seen all four hints");
  });
});
