'use client';

import React from 'react';

export interface ChapterStep {
  num: number;
  id: string;
  label: string;
}

const CHAPTER_STEPS: ChapterStep[] = [
  { num: 1, id: 'summary', label: 'Summary' },
  { num: 2, id: 'walkthrough', label: 'How it works' },
  { num: 3, id: 'issues', label: "What's wrong" },
  { num: 4, id: 'improvement', label: 'How to improve' },
  { num: 5, id: 'why-better', label: 'Why better' },
  { num: 6, id: 'complexity', label: 'Complexity' },
  { num: 7, id: 'edge-cases', label: 'Edge cases' },
  { num: 8, id: 'confidence', label: 'Confidence' },
  { num: 9, id: 'remember', label: 'Remember' },
];

export function ReportStepper() {
  const scrollToChapter = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav
      aria-label="Report navigation"
      className="sticky top-0 z-20 bg-surface/95 backdrop-blur-xs border-b border-border py-2 px-3 overflow-x-auto"
    >
      <div className="flex items-center gap-1 min-w-max">
        {CHAPTER_STEPS.map((step) => (
          <button
            key={step.id}
            onClick={() => scrollToChapter(step.id)}
            className="flex items-center gap-1 px-2 py-1 rounded-sm text-xs font-medium text-text-muted hover:text-text hover:bg-surface-hover transition-colors focus-visible:outline"
          >
            <span className="font-mono text-accent-strong font-semibold">{step.num}</span>
            <span className="hidden md:inline">{step.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
