import { HintSessionState, HintEntry } from '../../schemas/hint';
import { AppError } from '../../lib/errors';

export function createInitialHintState(problem: string): HintSessionState {
  return {
    problem,
    currentLevel: 0,
    status: 'active',
    entries: [],
  };
}

export function advanceHintLevel(state: HintSessionState, newEntry: HintEntry): HintSessionState {
  if (state.currentLevel >= 4) {
    throw new AppError('HINT_LIMIT_REACHED', "You've seen all four hints. Try implementing the algorithm outline.");
  }

  const nextLevel = Math.min(newEntry.level, 4) as 0 | 1 | 2 | 3 | 4;
  const isCompleted = nextLevel === 4;

  return {
    ...state,
    currentLevel: nextLevel,
    status: isCompleted ? 'completed' : 'active',
    entries: [...state.entries, newEntry],
  };
}

export function addAttemptFeedback(state: HintSessionState, feedbackEntry: HintEntry): HintSessionState {
  return {
    ...state,
    entries: [...state.entries, feedbackEntry],
  };
}
