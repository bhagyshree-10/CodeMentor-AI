import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { Hero } from '../../components/marketing/Hero';
import { AnimatedWhy } from '../../components/marketing/AnimatedWhy';

describe('Hero Component & AnimatedWhy', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('removes the small introductory badge', () => {
    render(<Hero />);
    expect(screen.queryByText('The AI Learning Studio for Code')).toBeNull();
  });

  it('keeps the main heading intact and visually prominent', () => {
    render(<Hero />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeDefined();
    expect(heading.textContent).toContain("Don't just fix your code.");
    expect(heading.textContent).toContain('Understand it.');
  });

  it('renders "Why" with initial palette class', () => {
    render(<AnimatedWhy />);
    const whyEl = screen.getByTestId('animated-why');
    expect(whyEl.textContent).toBe('Why');
    expect(whyEl.className).toContain('font-bold');
    expect(whyEl.className).toContain('text-accent-strong');
  });

  it('animates color every 1000ms', () => {
    render(<AnimatedWhy />);
    const whyEl = screen.getByTestId('animated-why');
    expect(whyEl.className).toContain('text-accent-strong');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(whyEl.className).toContain('text-accent');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(whyEl.className).toContain('text-text');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(whyEl.className).toContain('text-semantic-warning');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(whyEl.className).toContain('text-accent-strong');
  });

  it('respects prefers-reduced-motion by keeping static styling without cycling', () => {
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    render(<AnimatedWhy />);
    const whyEl = screen.getByTestId('animated-why');
    expect(whyEl.className).toContain('text-accent-strong');

    act(() => {
      vi.advanceTimersByTime(4000);
    });
    // Remains static
    expect(whyEl.className).toContain('text-accent-strong');
  });
});
