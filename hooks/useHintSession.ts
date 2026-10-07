import { useState } from 'react';
import { HintEntry } from '../schemas/hint';

export interface HintResponseData {
  analysisId: string;
  currentLevel: number;
  status: 'active' | 'completed';
  entry: HintEntry;
  quota: {
    hintsUsed: number;
    hintsLimit: number;
    resetsAt: string;
  };
}

export function useHintSession() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [entries, setEntries] = useState<HintEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startSession = async (problem: string, language?: string, attempt?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start', problem, language, attempt }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || 'Failed to start hint session');
      }
      const data: HintResponseData = json.data;
      setAnalysisId(data.analysisId);
      setCurrentLevel(data.currentLevel);
      setEntries([data.entry]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error starting hint session');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const revealNext = async () => {
    if (!analysisId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'next', analysisId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || 'Failed to reveal next hint');
      }
      const data: HintResponseData = json.data;
      setCurrentLevel(data.currentLevel);
      setEntries((prev) => [...prev, data.entry]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error revealing next hint');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const submitAttempt = async (attempt: string) => {
    if (!analysisId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/hint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'attempt', analysisId, attempt }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || 'Failed to submit attempt');
      }
      const data: HintResponseData = json.data;
      setEntries((prev) => [...prev, data.entry]);
      return data;
    } catch (err: any) {
      setError(err.message || 'Error submitting attempt');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    analysisId,
    currentLevel,
    entries,
    loading,
    error,
    startSession,
    revealNext,
    submitAttempt,
    setAnalysisId,
    setCurrentLevel,
    setEntries,
  };
}
