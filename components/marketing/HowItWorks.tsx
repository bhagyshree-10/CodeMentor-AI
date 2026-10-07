import React from 'react';
import { FileCode, BookOpen, Lightbulb, History } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '1',
      title: 'Paste your snippet',
      desc: 'Paste any single function or snippet. Language is auto-detected. Choose your focus: Understand, Debug, or Improve.',
      icon: FileCode,
    },
    {
      num: '2',
      title: 'Read structured "Why"',
      desc: 'Instead of raw code output, get a 9-chapter report breaking down walkthroughs, failing inputs, and line diffs.',
      icon: BookOpen,
    },
    {
      num: '3',
      title: 'Get DSA hints without spoilers',
      desc: 'For algorithm problems, reveal guidance one rung at a time. Server state prevents skipping ahead or leaking answers.',
      icon: Lightbulb,
    },
    {
      num: '4',
      title: 'Track recurring mistakes',
      desc: 'Mistake Memory flags recurring habits like off-by-one or null-handling across your learning sessions.',
      icon: History,
    },
  ];

  return (
    <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto border-t border-border">
      <div className="text-center mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">Designed for Comprehension, Not Chatting</h2>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Four clear steps to turn code fixes into permanent understanding.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.num} className="p-6 bg-surface border border-border rounded-lg flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-DEFAULT bg-accent-tint text-accent-strong flex items-center justify-center font-bold font-mono">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-text">
                {s.num}. {s.title}
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">{s.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
