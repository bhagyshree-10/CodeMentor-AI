'use client';

import React from 'react';
import { SegmentedControl } from '../ui/SegmentedControl';
import { INTENTS, AnalysisIntent } from '../../lib/constants';

export interface FocusSelectorProps {
  value: AnalysisIntent;
  onChange: (intent: AnalysisIntent) => void;
}

export function FocusSelector({ value, onChange }: FocusSelectorProps) {
  const options = INTENTS.map((intent) => ({
    value: intent,
    label: intent.charAt(0).toUpperCase() + intent.slice(1),
  }));

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-text">Focus</span>
      <SegmentedControl value={value} onValueChange={onChange} options={options} ariaLabel="Analysis focus" />
    </div>
  );
}
