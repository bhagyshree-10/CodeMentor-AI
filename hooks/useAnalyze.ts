import { useState } from 'react';
import { AnalysisResult } from '../schemas/analysis';
import { RecurrenceInsight } from '../services/insight-service';
import { SupportedLanguage, AnalysisIntent } from '../lib/constants';

export interface AnalyzeResponseData {
  analysisId: string;
  result: AnalysisResult;
  insight: RecurrenceInsight | null;
  saved: boolean;
  cached: boolean;
  quota: {
    analysesUsed: number;
    analysesLimit: number;
    resetsAt: string;
  };
}

export function useAnalyze() {
  const [data, setData] = useState<AnalyzeResponseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeCode = async (options: {
    code: string;
    language: SupportedLanguage;
    intent: AnalysisIntent;
    context?: string;
  }) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(options),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json?.error?.message || 'Failed to analyze code.');
      }

      setData(json.data);
      return json.data;
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during analysis.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    analyzeCode,
    setData,
  };
}
