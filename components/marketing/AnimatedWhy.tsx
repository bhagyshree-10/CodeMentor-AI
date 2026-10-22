'use client';

import React, { useEffect, useState } from 'react';

// Palette-consistent colors from the CodeMentor AI design system
const PALETTE_CLASSES = [
  'text-accent-strong',
  'text-accent',
  'text-text',
  'text-semantic-warning',
];

export function AnimatedWhy() {
  const [colorIndex, setColorIndex] = useState(0);

  useEffect(() => {
    // Check for user reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      return;
    }

    const interval = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % PALETTE_CLASSES.length);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <strong
      data-testid="animated-why"
      className={`font-bold transition-colors duration-700 ease-in-out motion-reduce:transition-none motion-reduce:text-accent-strong ${PALETTE_CLASSES[colorIndex]}`}
    >
      Why
    </strong>
  );
}
