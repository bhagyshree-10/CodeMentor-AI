'use client';

import React, { useState, useEffect } from 'react';
import { CodeEditor } from './CodeEditor';
import { LanguageSelect } from './LanguageSelect';
import { FocusSelector } from './FocusSelector';
import { ModeTabs, WorkspaceMode } from './ModeTabs';
import { AnalysisReport } from '../analysis/AnalysisReport';
import { HintLadder } from '../hint/HintLadder';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Input';
import { ErrorState } from '../ui/ErrorState';
import { UsageMeter } from '../ui/UsageMeter';
import { useAnalyze } from '../../hooks/useAnalyze';
import { useHintSession } from '../../hooks/useHintSession';
import { detectLanguage } from '../../lib/language/detect';
import { SupportedLanguage, AnalysisIntent, LIMITS } from '../../lib/constants';
import { Play, Sparkles } from 'lucide-react';

const EXAMPLE_SNIPPETS = {
  python: `def two_sum(nums, target):\n    for i in range(len(nums)):\n        for j in range(i + 1, len(nums)):\n            if nums[i] + nums[j] == target:\n                return [i, j]\n    return []`,
  javascript: `function findDuplicates(arr) {\n  let duplicates = [];\n  for (let i = 0; i <= arr.length; i++) {\n    for (let j = i + 1; j < arr.length; j++) {\n      if (arr[i] === arr[j]) duplicates.push(arr[i]);\n    }\n  }\n  return duplicates;\n}`,
  java: `public class Main {\n    public static int findMax(int[] nums) {\n        int max = 0;\n        for (int i = 0; i < nums.length; i++) {\n            if (nums[i] > max) max = nums[i];\n        }\n        return max;\n    }\n}`,
};

export function WorkspaceShell() {
  const [mode, setMode] = useState<WorkspaceMode>('analyze');
  const [mobileTab, setMobileTab] = useState<'code' | 'report'>('code');

  // Analyze Mode State
  const [code, setCode] = useState(EXAMPLE_SNIPPETS.python);
  const [language, setLanguage] = useState<SupportedLanguage>('python');
  const [intent, setIntent] = useState<AnalysisIntent>('understand');
  const [context, setContext] = useState('');
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  const [isManuallySelected, setIsManuallySelected] = useState(false);
  const [highlightLines, setHighlightLines] = useState<{ start: number; end: number } | null>(null);

  const { data: analyzeData, loading: analyzeLoading, error: analyzeError, analyzeCode } = useAnalyze();

  // Hint Mode State
  const [problemText, setProblemText] = useState('');
  const [hintAttempt, setHintAttempt] = useState('');
  const {
    currentLevel,
    entries: hintEntries,
    loading: hintLoading,
    error: hintError,
    startSession,
    revealNext,
    submitAttempt,
  } = useHintSession();

  // Auto-detect language ONLY if the user has not manually selected one
  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    if (!isManuallySelected) {
      const detection = detectLanguage(newCode);
      if (detection.language && detection.confidence !== 'low') {
        setLanguage(detection.language);
        setIsAutoDetected(true);
      }
    }
  };

  const lineCount = code.split('\n').length;
  const charCount = code.length;
  const isOverLimits = charCount > LIMITS.MAX_CODE_CHARS || lineCount > LIMITS.MAX_CODE_LINES;

  const handleAnalyze = async () => {
    if (!code.trim() || isOverLimits) return;
    try {
      await analyzeCode({
        code,
        language,
        intent,
        context: context.trim() || undefined,
      });
      setMobileTab('report');
    } catch {
      // Handled by hook
    }
  };

  // Keyboard shortcut Ctrl+Enter to trigger analyze
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (mode === 'analyze' && code.trim() && !isOverLimits && !analyzeLoading) {
          e.preventDefault();
          handleAnalyze();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, language, intent, context, isOverLimits, analyzeLoading, mode]);

  const loadExample = (lang: 'python' | 'javascript' | 'java') => {
    setCode(EXAMPLE_SNIPPETS[lang]);
    setLanguage(lang);
    setIsAutoDetected(false);
  };

  const handleStartHint = async () => {
    if (!problemText.trim()) return;
    await startSession(problemText.trim(), language, hintAttempt.trim() || undefined);
    setMobileTab('report');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] w-full max-w-[1600px] mx-auto overflow-hidden bg-bg">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between px-6 py-2 bg-surface border-b border-border gap-4 flex-wrap">
        <ModeTabs value={mode} onValueChange={setMode} />

        <div className="flex items-center gap-4">
          <UsageMeter used={analyzeData?.quota?.analysesUsed || 0} limit={LIMITS.DEFAULT_DAILY_ANALYSIS_LIMIT} />

          {/* Mobile view segmented toggle */}
          <div className="flex lg:hidden bg-surface-muted p-1 rounded-DEFAULT border border-border">
            <button
              onClick={() => setMobileTab('code')}
              className={`px-3 py-1 text-xs font-semibold rounded-sm ${
                mobileTab === 'code' ? 'bg-accent-tint text-text' : 'text-text-muted'
              }`}
            >
              Editor
            </button>
            <button
              onClick={() => setMobileTab('report')}
              className={`px-3 py-1 text-xs font-semibold rounded-sm ${
                mobileTab === 'report' ? 'bg-accent-tint text-text' : 'text-text-muted'
              }`}
            >
              Report
            </button>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden">
        {mode === 'analyze' ? (
          <>
            {/* Left Pane: Code Input */}
            <div
              className={`w-full lg:w-1/2 flex flex-col p-4 border-r border-border overflow-y-auto bg-surface ${
                mobileTab === 'report' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-3 flex-wrap">
                <LanguageSelect
                  value={language}
                  onChange={(l) => {
                    setLanguage(l);
                    setIsManuallySelected(true);
                    setIsAutoDetected(false);
                  }}
                  isAutoDetected={isAutoDetected}
                />
                <FocusSelector value={intent} onChange={setIntent} />
              </div>

              {/* Code Mirror Editor */}
              <div className="flex-1 flex flex-col min-h-[320px] mb-3">
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  language={language}
                  highlightLines={highlightLines}
                />

                <div className="flex items-center justify-between text-xs text-text-muted pt-1.5 px-1 font-mono">
                  <span>
                    {charCount} / {LIMITS.MAX_CODE_CHARS} chars · {lineCount} / {LIMITS.MAX_CODE_LINES} lines
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => loadExample('python')}
                      className="hover:underline text-accent-strong"
                    >
                      Try Python Example
                    </button>
                  </div>
                </div>
              </div>

              {/* Optional Error/Context Box */}
              <div className="mb-4">
                <Textarea
                  label="Context / Error Message (Optional)"
                  placeholder="e.g. Raises IndexError on empty list input..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={2}
                  maxLength={LIMITS.MAX_CONTEXT_CHARS}
                />
              </div>

              {/* Analyze Action Button */}
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-xs text-text-muted hidden sm:inline">Press Ctrl+Enter to Analyze</span>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleAnalyze}
                  isLoading={analyzeLoading}
                  disabled={!code.trim() || isOverLimits}
                  className="w-full sm:w-auto gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze</span>
                </Button>
              </div>
            </div>

            {/* Right Pane: Report Output */}
            <div
              className={`w-full lg:w-1/2 flex flex-col overflow-y-auto bg-surface ${
                mobileTab === 'code' ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {analyzeError && (
                <div className="p-4">
                  <ErrorState message={analyzeError} onRetry={handleAnalyze} />
                </div>
              )}

              {analyzeLoading ? (
                <div className="p-8 flex flex-col gap-6 max-w-xl mx-auto w-full">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-text">Analyzing your code structure...</span>
                  </div>
                  <div className="h-20 bg-surface-muted rounded-DEFAULT animate-pulse" />
                  <div className="h-32 bg-surface-muted rounded-DEFAULT animate-pulse" />
                  <div className="h-40 bg-surface-muted rounded-DEFAULT animate-pulse" />
                </div>
              ) : analyzeData ? (
                <AnalysisReport
                  analysisId={analyzeData.analysisId}
                  originalCode={code}
                  result={analyzeData.result}
                  insight={analyzeData.insight}
                  onHighlightLines={(start, end) => setHighlightLines({ start, end })}
                />
              ) : (
                /* Empty Preview State: 9 Chapters Outline */
                <div className="p-8 max-w-md mx-auto my-auto text-center flex flex-col items-center gap-4">
                  <div className="p-3 rounded-full bg-accent-tint text-accent-strong">
                    <Play className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-text">What you&apos;ll get in your report</h3>
                  <div className="w-full text-left font-mono text-xs text-text-muted space-y-1.5 p-4 bg-bg border border-border rounded-DEFAULT">
                    <p>01. Summary & Core Purpose</p>
                    <p>02. Line-by-Line Walkthrough</p>
                    <p>03. What&apos;s Wrong, and Why (Failing Inputs)</p>
                    <p>04. How to Improve (Line Diff)</p>
                    <p>05. Why This Solution Is Better</p>
                    <p>06. Complexity (AI-estimated Big-O)</p>
                    <p>07. Edge Cases to Test</p>
                    <p>08. Model Confidence & Caveats</p>
                    <p>09. Key Takeaways & Self-Check Question</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => loadExample('python')}>
                    Try Python Example
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Hint Ladder Mode */
          <div className="w-full flex flex-col lg:flex-row overflow-y-auto">
            {/* Left Problem Box */}
            <div className="w-full lg:w-1/2 p-6 border-r border-border flex flex-col gap-4 bg-surface">
              <h2 className="text-lg font-bold text-text">DSA Hint Ladder Setup</h2>
              <Textarea
                label="Problem Statement (Required)"
                placeholder="Paste the DSA problem statement here..."
                value={problemText}
                onChange={(e) => setProblemText(e.target.value)}
                rows={6}
                maxLength={LIMITS.MAX_PROBLEM_CHARS}
              />
              <Textarea
                label="Your Attempt (Optional)"
                placeholder="Paste your current code attempt here..."
                value={hintAttempt}
                onChange={(e) => setHintAttempt(e.target.value)}
                rows={5}
              />
              <Button
                variant="primary"
                size="lg"
                onClick={handleStartHint}
                isLoading={hintLoading}
                disabled={!problemText.trim()}
              >
                Start Hint Session
              </Button>
            </div>

            {/* Right Hint Ladder Visualization */}
            <div className="w-full lg:w-1/2 p-4 bg-surface">
              {hintError && <ErrorState message={hintError} />}
              <HintLadder
                problem={problemText || 'Sample DSA Problem'}
                currentLevel={currentLevel}
                entries={hintEntries}
                onRevealNext={async () => {
                  await revealNext();
                }}
                onSubmitAttempt={async (attemptText: string) => {
                  await submitAttempt(attemptText);
                }}
                isLoading={hintLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
