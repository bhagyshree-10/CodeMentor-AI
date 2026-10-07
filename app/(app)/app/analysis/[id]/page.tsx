'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AnalysisReport } from '@/components/analysis/AnalysisReport';
import { HintLadder } from '@/components/hint/HintLadder';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useHintSession } from '@/hooks/useHintSession';
import { AnalysisResult } from '@/schemas/analysis';
import { RecurrenceInsight } from '@/services/insight-service';
import { CodeEditor } from '@/components/workspace/CodeEditor';
import { SupportedLanguage } from '@/lib/constants';

export default function AnalysisDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doc, setDoc] = useState<any>(null);
  const [highlightLines, setHighlightLines] = useState<{ start: number; end: number } | null>(null);

  const {
    currentLevel,
    entries,
    revealNext,
    submitAttempt,
    setAnalysisId,
    setCurrentLevel,
    setEntries,
  } = useHintSession();

  useEffect(() => {
    async function loadAnalysis() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(`/api/analyses/${id}`);
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data?.error?.message || 'This analysis does not exist or was deleted.');
        }

        setDoc(data.data);

        if (data.data.kind === 'hint' && data.data.hintSession) {
          setAnalysisId(id);
          setCurrentLevel(data.data.hintSession.currentLevel);
          setEntries(data.data.hintSession.entries || []);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load analysis');
      } finally {
        setLoading(false);
      }
    }
    loadAnalysis();
  }, [id, setAnalysisId, setCurrentLevel, setEntries]);

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto w-full flex flex-col gap-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="p-8 max-w-xl mx-auto w-full">
        <ErrorState message={error || 'Analysis not found'} />
      </div>
    );
  }

  const handleReveal = async () => {
    await revealNext();
  };

  const handleAttempt = async (text: string) => {
    await submitAttempt(text);
  };

  if (doc.kind === 'hint' && doc.hintSession) {
    return (
      <div className="p-6 max-w-4xl mx-auto w-full">
        <HintLadder
          problem={doc.hintSession.problem}
          currentLevel={currentLevel}
          entries={entries}
          onRevealNext={handleReveal}
          onSubmitAttempt={handleAttempt}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row w-full flex-1 overflow-hidden bg-bg">
      {/* Code Snapshot Pane if code was stored */}
      {doc.code && (
        <div className="w-full lg:w-1/2 p-4 border-r border-border bg-surface flex flex-col">
          <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">Code Snapshot</h2>
          <div className="flex-1 min-h-[360px]">
            <CodeEditor
              value={doc.code}
              language={(doc.language as SupportedLanguage) || 'python'}
              readOnly
              highlightLines={highlightLines}
            />
          </div>
        </div>
      )}

      {/* Analysis Report Pane */}
      <div className={`w-full ${doc.code ? 'lg:w-1/2' : 'max-w-4xl mx-auto'} overflow-y-auto bg-surface`}>
        <AnalysisReport
          analysisId={doc.id}
          originalCode={doc.code}
          result={doc.result as AnalysisResult}
          insight={doc.insight as RecurrenceInsight}
          onHighlightLines={(start: number, end: number) => setHighlightLines({ start, end })}
        />
      </div>
    </div>
  );
}
