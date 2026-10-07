'use client';

import React from 'react';
import { PatternChips } from '../history/PatternChips';
import { PatternCallout } from '../analysis/PatternCallout';

export function MemoryDemo() {
  const sampleTopTags = [
    { tag: 'off-by-one', count: 5 },
    { tag: 'missing-edge-case', count: 4 },
    { tag: 'null-handling', count: 3 },
    { tag: 'inefficient-lookup', count: 2 },
  ];

  return (
    <section className="py-16 px-6 max-w-5xl mx-auto border-t border-border">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-2">Mistake Memory Across Sessions</h2>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          The product tags mistake patterns server-side and calls out recurring habits when they appear again.
        </p>
      </div>

      <div className="p-6 bg-surface border border-border rounded-lg shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            1. Recurrence Callout in Report Chapter 9
          </h3>
          <PatternCallout
            insight={{
              tag: 'missing-edge-case',
              earlierCount: 4,
              href: '#',
              message: "You've hit missing-edge-case in 4 earlier analyses.",
            }}
          />
        </div>

        <div className="pt-4 border-t border-border">
          <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
            2. Pattern Filter Chips in History
          </h3>
          <PatternChips topTags={sampleTopTags} onSelectTag={() => {}} />
        </div>
      </div>
    </section>
  );
}
