'use client';

import React from 'react';
import { AnalysisResult } from '../../schemas/analysis';
import { RecurrenceInsight } from '../../services/insight-service';
import { ReportStepper } from './ReportStepper';
import { IssueRow } from './IssueRow';
import { DiffView } from './DiffView';
import { ComplexityBlock } from './ComplexityBlock';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { PatternCallout } from './PatternCallout';
import { ReportIncorrect } from './ReportIncorrect';
import { CheckCircle2, HelpCircle } from 'lucide-react';

export interface AnalysisReportProps {
  analysisId: string;
  originalCode?: string;
  result: AnalysisResult;
  insight?: RecurrenceInsight | null;
  onHighlightLines?: (start: number, end: number) => void;
}

export function AnalysisReport({
  analysisId,
  originalCode,
  result,
  insight,
  onHighlightLines,
}: AnalysisReportProps) {
  return (
    <div className="flex flex-col w-full bg-surface min-h-full">
      <ReportStepper />

      <div className="p-6 max-w-[68ch] mx-auto w-full flex flex-col gap-10 text-text">
        {/* Chapter 1: Summary */}
        <section id="summary" className="scroll-mt-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-accent-strong font-bold">01</span>
            <h2 className="text-xl font-bold text-text">Summary</h2>
          </div>
          <p className="text-base leading-relaxed text-text font-normal">{result.summary}</p>
        </section>

        <hr className="border-border" />

        {/* Chapter 2: How it works */}
        <section id="walkthrough" className="scroll-mt-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-mono text-accent-strong font-bold">02</span>
            <h2 className="text-xl font-bold text-text">How it works</h2>
          </div>
          <div className="flex flex-col gap-3">
            {result.walkthrough.map((block) => (
              <div
                key={block.id}
                onClick={() => onHighlightLines?.(block.lineStart, block.lineEnd)}
                className="p-3 bg-bg border border-border rounded-DEFAULT hover:border-border-control transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-text">{block.title}</h3>
                  <span className="text-xs font-mono text-text-muted">
                    Lines {block.lineStart}–{block.lineEnd}
                  </span>
                </div>
                <p className="text-sm text-text-muted">{block.explanation}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-border" />

        {/* Chapter 3: What's wrong, and why */}
        <section id="issues" className="scroll-mt-16">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-accent-strong font-bold">03</span>
              <h2 className="text-xl font-bold text-text">What&apos;s wrong, and why</h2>
            </div>
            <span className="text-xs text-text-muted font-mono">{result.issues.length} issues found</span>
          </div>

          {result.issues.length === 0 ? (
            <div className="p-4 bg-bg border border-border rounded-DEFAULT flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-semantic-success shrink-0" />
              <div>
                <p className="text-sm font-medium text-text">No issues found.</p>
                <p className="text-xs text-text-muted">
                  See Confidence below for what this does and does not guarantee.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {result.issues.map((issue) => (
                <IssueRow key={issue.id} issue={issue} onHighlightLines={onHighlightLines} />
              ))}
            </div>
          )}
        </section>

        <hr className="border-border" />

        {/* Chapter 4: How to improve */}
        <section id="improvement" className="scroll-mt-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-mono text-accent-strong font-bold">04</span>
            <h2 className="text-xl font-bold text-text">How to improve</h2>
          </div>

          {result.improvement ? (
            <div>
              <p className="text-sm text-text mb-3">{result.improvement.approach}</p>
              {result.improvement.changes.length > 0 && (
                <ul className="list-disc pl-5 text-sm text-text-muted space-y-1 mb-4">
                  {result.improvement.changes.map((ch, idx) => (
                    <li key={idx}>{ch.description}</li>
                  ))}
                </ul>
              )}

              {originalCode && (
                <DiffView originalCode={originalCode} improvedCode={result.improvement.code} />
              )}
            </div>
          ) : (
            <p className="text-sm text-text-muted italic">No specific code improvements required.</p>
          )}
        </section>

        <hr className="border-border" />

        {/* Chapter 5: Why this is better */}
        <section id="why-better" className="scroll-mt-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-accent-strong font-bold">05</span>
            <h2 className="text-xl font-bold text-text">Why this is better</h2>
          </div>
          <p className="text-sm text-text leading-relaxed">
            {result.improvement?.whyBetter || 'The code structure is already clear and concise.'}
          </p>
        </section>

        <hr className="border-border" />

        {/* Chapter 6: Complexity */}
        <section id="complexity" className="scroll-mt-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-accent-strong font-bold">06</span>
            <h2 className="text-xl font-bold text-text">Complexity</h2>
          </div>
          <ComplexityBlock complexity={result.complexity} />
        </section>

        <hr className="border-border" />

        {/* Chapter 7: Edge cases */}
        <section id="edge-cases" className="scroll-mt-16">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-accent-strong font-bold">07</span>
              <h2 className="text-xl font-bold text-text">Edge cases to test</h2>
            </div>
          </div>

          {result.edgeCases.length === 0 ? (
            <p className="text-sm text-text-muted italic">No specific edge cases flagged for this snippet.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {result.edgeCases.map((ec, idx) => (
                <div key={idx} className="p-3 bg-bg border border-border rounded-DEFAULT">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-text font-semibold">Test input: {ec.input}</span>
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-sm font-medium ${
                        ec.handledByOriginal === 'yes'
                          ? 'bg-semantic-success/10 text-semantic-success'
                          : ec.handledByOriginal === 'no'
                          ? 'bg-semantic-error/10 text-semantic-error'
                          : 'bg-surface-muted text-text-muted'
                      }`}
                    >
                      Handled: {ec.handledByOriginal}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">Expected behavior: {ec.expectedBehavior}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <hr className="border-border" />

        {/* Chapter 8: Confidence */}
        <section id="confidence" className="scroll-mt-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-mono text-accent-strong font-bold">08</span>
            <h2 className="text-xl font-bold text-text">Confidence</h2>
          </div>
          <div className="p-4 bg-bg border border-border rounded-DEFAULT flex flex-col gap-2">
            <ConfidenceIndicator level={result.overallConfidence.level} />
            {result.overallConfidence.caveats.length > 0 && (
              <ul className="list-disc pl-5 text-xs text-text-muted space-y-1">
                {result.overallConfidence.caveats.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            )}
            <p className="text-xs text-text-muted italic mt-1">
              Note: Reports are AI-generated static reasoning and may contain errors. Always verify by running your own tests.
            </p>
          </div>
        </section>

        <hr className="border-border" />

        {/* Chapter 9: Remember */}
        <section id="remember" className="scroll-mt-16 pb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-mono text-accent-strong font-bold">09</span>
            <h2 className="text-xl font-bold text-text">Remember</h2>
          </div>

          {insight && <PatternCallout insight={insight} />}

          <div className="p-4 bg-surface-muted border border-border rounded-DEFAULT mb-4">
            <h3 className="text-xs font-semibold text-text uppercase tracking-wider mb-2">Key Takeaways</h3>
            <ul className="list-disc pl-5 text-sm text-text space-y-1 mb-4">
              {result.takeaways.remember.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>

            <div className="pt-3 border-t border-border flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-accent-strong block">Self-Check Question</span>
                <p className="text-sm text-text italic">{result.takeaways.selfCheck}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <ReportIncorrect analysisId={analysisId} />
          </div>
        </section>
      </div>
    </div>
  );
}
