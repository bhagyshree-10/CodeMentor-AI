'use client';

import React, { useState } from 'react';
import { Textarea } from '../ui/Input';
import { Button } from '../ui/Button';

export interface AttemptBoxProps {
  onSubmitAttempt: (attemptText: string) => Promise<void>;
  isLoading?: boolean;
}

export function AttemptBox({ onSubmitAttempt, isLoading }: AttemptBoxProps) {
  const [attempt, setAttempt] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attempt.trim()) return;
    await onSubmitAttempt(attempt.trim());
    setAttempt('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 p-3 bg-surface border border-border rounded-DEFAULT my-4">
      <Textarea
        label="Add / Update your attempt code"
        placeholder="Paste your attempt code here to get feedback without revealing the full solution..."
        value={attempt}
        onChange={(e) => setAttempt(e.target.value)}
        rows={3}
      />
      <div className="flex justify-end">
        <Button type="submit" variant="secondary" size="sm" isLoading={isLoading} disabled={!attempt.trim()}>
          Submit Attempt for Feedback
        </Button>
      </div>
    </form>
  );
}
