'use client';

import React, { useState } from 'react';
import { Flag, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Textarea } from '../ui/Input';

export interface ReportIncorrectProps {
  analysisId: string;
}

export function ReportIncorrect({ analysisId }: ReportIncorrectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          analysisId,
          kind: 'incorrect',
          note: note.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      }
    } catch {
      // Error handling
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-xs text-text-muted hover:text-semantic-error gap-1.5"
      >
        <Flag className="w-3.5 h-3.5" />
        Report incorrect analysis
      </Button>

      <Dialog
        open={isOpen}
        onOpenChange={(val) => {
          setIsOpen(val);
          if (!val) setSubmitted(false);
        }}
        title="Report Incorrect Analysis"
        description="Help us improve. Describe why this report or bug identification is incorrect."
      >
        {submitted ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <CheckCircle className="w-8 h-8 text-semantic-success mb-2" />
            <p className="text-sm font-semibold text-text">Thanks, reported!</p>
            <p className="text-xs text-text-muted mt-1">Our engineering team reviews reported cases for quality tuning.</p>
            <Button size="sm" onClick={() => setIsOpen(false)} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Textarea
              label="Optional Note (max 500 chars)"
              placeholder="e.g. The issue on line 4 claims an index error, but range boundary is valid."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={500}
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" size="sm" isLoading={isSubmitting}>
                Submit Feedback
              </Button>
            </div>
          </form>
        )}
      </Dialog>
    </>
  );
}
