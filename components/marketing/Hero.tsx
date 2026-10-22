'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { ArrowRight } from 'lucide-react';
import { AnimatedWhy } from './AnimatedWhy';

export function Hero() {
  return (
    <section className="py-20 px-6 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
      <div className="flex-1 flex flex-col items-start gap-6">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-text leading-tight">
          Don&apos;t just fix your code. <span className="text-accent-strong">Understand it.</span>
        </h1>

        <p className="text-lg text-text-muted leading-relaxed max-w-xl">
          Paste your code. See what it does, where it breaks, <AnimatedWhy /> it breaks, and what to remember.
          For students and developers who want to learn from their own code.
        </p>

        <div className="flex items-center gap-4 pt-2">
          <Link href="/login">
            <Button size="lg" className="gap-2">
              <span>Sign in to start</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <a href="#sample-report">
            <Button variant="secondary" size="lg">
              See a sample report
            </Button>
          </a>
        </div>
      </div>

      <div className="flex-1 w-full max-w-lg p-5 bg-surface border border-border rounded-lg shadow-md">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-border text-xs text-text-muted font-mono">
          <span>Python · auto-detected</span>
          <span className="text-accent-strong font-semibold">Report Preview</span>
        </div>
        <div className="font-mono text-xs p-3 bg-bg border border-border rounded-DEFAULT mb-3 text-text">
          <span className="text-text-muted">1</span> def two_sum(nums, target):<br />
          <span className="text-text-muted">2</span> &nbsp;&nbsp;for i in range(len(nums)):<br />
          <span className="bg-accent-tint text-accent-strong px-1 border-l-2 border-accent">
            <span className="text-text-muted">3</span> &nbsp;&nbsp;&nbsp;&nbsp;for j in range(len(nums)): # Bug!
          </span><br />
          <span className="text-text-muted">4</span> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if nums[i] + nums[j] == target:
        </div>
        <div className="p-3 bg-surface-muted border-l-2 border-semantic-error rounded-xs text-xs">
          <span className="font-semibold text-semantic-error block mb-1">Issue 1: Duplicate Index Pair Check</span>
          <p className="text-text-muted">Inner loop starts at index 0 instead of i+1, causing index i to pair with itself.</p>
        </div>
      </div>
    </section>
  );
}
