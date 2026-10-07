import React from 'react';
import Link from 'next/link';
import { Hero } from '../../components/marketing/Hero';
import { HowItWorks } from '../../components/marketing/HowItWorks';
import { SampleReport } from '../../components/marketing/SampleReport';
import { HintLadderDemo } from '../../components/marketing/HintLadderDemo';
import { MemoryDemo } from '../../components/marketing/MemoryDemo';
import { Button } from '../../components/ui/Button';
import { ArrowRight, ShieldAlert } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero */}
      <Hero />

      {/* 2. Problem Statement */}
      <section className="py-16 px-6 bg-surface-hover border-y border-border text-center">
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <h2 className="text-xl md:text-2xl font-semibold text-text">
            AI can fix your code in seconds. So why do you keep making the same mistakes?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-sm text-text-muted">
            <div className="p-4 bg-surface rounded-DEFAULT border border-border">
              <span className="font-semibold text-text block mb-1">Fixes aren&apos;t lessons</span>
              Copy-pasting an answer teaches you nothing about why it failed.
            </div>
            <div className="p-4 bg-surface rounded-DEFAULT border border-border">
              <span className="font-semibold text-text block mb-1">Mistakes repeat</span>
              Without session memory, off-by-one errors return again and again.
            </div>
            <div className="p-4 bg-surface rounded-DEFAULT border border-border">
              <span className="font-semibold text-text block mb-1">Chatbots spoil DSA</span>
              Asking general AI for help usually reveals the solution immediately.
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <HowItWorks />

      {/* 4. Sample Report */}
      <SampleReport />

      {/* 5. Hint Ladder Demo */}
      <HintLadderDemo />

      {/* 6. Mistake Memory Demo */}
      <MemoryDemo />

      {/* 7. What it isn't (Emphasis Band) */}
      <section className="py-16 px-6 bg-surface-hover border-y border-border text-center">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-text">What CodeMentor AI Is Not</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-text-muted">
            <div className="p-4 bg-surface rounded-DEFAULT border border-border">
              <strong className="text-text block mb-1">Not a Chatbot</strong>
              No message bubbles or generic chat box. Every output is a structured learning report.
            </div>
            <div className="p-4 bg-surface rounded-DEFAULT border border-border">
              <strong className="text-text block mb-1">Not a Copilot Clone</strong>
              It does not autocomplete as you type. It reads what you wrote to explain where it breaks.
            </div>
            <div className="p-4 bg-surface rounded-DEFAULT border border-border">
              <strong className="text-text block mb-1">Not a Code Runner</strong>
              User code is never executed on our servers. Analysis is pure static reasoning.
            </div>
          </div>
        </div>
      </section>

      {/* 8. Honest Note */}
      <section className="py-12 px-6 max-w-3xl mx-auto text-center flex flex-col items-center gap-3">
        <ShieldAlert className="w-6 h-6 text-semantic-warning" />
        <h3 className="text-base font-semibold text-text">Honest Note on AI Models</h3>
        <p className="text-xs text-text-muted leading-relaxed">
          AI models can be wrong. Every report shows model confidence levels and lets you flag incorrect findings.
          Please do not paste secrets, API credentials, or private proprietary code.
        </p>
      </section>

      {/* 9. Final CTA */}
      <section className="py-20 px-6 max-w-4xl mx-auto text-center flex flex-col items-center gap-6 border-t border-border">
        <h2 className="text-3xl font-bold text-text">Ready to understand your code?</h2>
        <p className="text-sm text-text-muted max-w-md">
          Paste your first snippet and see what you learn from your own code.
        </p>
        <Link href="/app">
          <Button size="lg" className="gap-2">
            <span>Paste your first snippet</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
