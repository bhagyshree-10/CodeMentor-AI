import { useState } from 'react';
import { HintEntry } from '../schemas/hint';

export interface HintResponseData {
  analysisId: string;
  currentLevel: number;
  status: 'active' | 'completed';
  entry?: HintEntry;
  entries?: HintEntry[];
  quota: {
    hintsUsed: number;
    hintsLimit: number;
    resetsAt: string;
  };
}

export function useHintSession() {
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState<number>(0);
  const [entries, setEntries] = useState<HintEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetSession = () => {
    setAnalysisId(null);
    setCurrentLevel(0);
    setEntries([]);
    setError(null);
  };

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
      setCurrentLevel(data.currentLevel ?? 0);
      setEntries(data.entries || (data.entry ? [data.entry] : []));
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
      if (data.entries) {
        setEntries(data.entries);
      } else if (data.entry) {
        setEntries((prev) => {
          const exists = prev.some((e) => e.level === data.entry!.level && e.type === data.entry!.type);
          return exists ? prev : [...prev, data.entry!];
        });
      }
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
      if (data.entry) {
        setEntries((prev) => [...prev, data.entry!]);
      }
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
    resetSession,
    setAnalysisId,
    setCurrentLevel,
    setEntries,
  };
}
