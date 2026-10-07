import React from 'react';
import Link from 'next/link';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Button } from '../../components/ui/Button';
import { Code2 } from 'lucide-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      {/* Public Header */}
      <header className="h-14 px-6 border-b border-border bg-surface flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2 font-bold text-text hover:opacity-90">
          <div className="w-7 h-7 rounded-DEFAULT bg-accent-strong text-on-accent flex items-center justify-center font-mono text-xs">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="text-sm">CodeMentor AI</span>
        </Link>

        <nav className="flex items-center gap-4">
          <a href="#how-it-works" className="text-xs font-semibold text-text-muted hover:text-text transition-colors">
            How it works
          </a>
          <a href="#sample-report" className="text-xs font-semibold text-text-muted hover:text-text transition-colors hidden sm:inline">
            Sample Report
          </a>
          <ThemeToggle />
          <Link href="/app">
            <Button size="sm">Sign in</Button>
          </Link>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Public Footer */}
      <footer className="py-8 px-6 border-t border-border bg-surface text-center text-xs text-text-muted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} CodeMentor AI. Built for comprehension.</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
