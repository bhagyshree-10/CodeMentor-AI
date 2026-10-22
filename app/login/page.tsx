import React, { Suspense } from 'react';
import { AuthForm } from '@/components/auth/AuthForm';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Sign In | CodeMentor AI',
  description: 'Sign in to CodeMentor AI - The AI Learning Studio for Code',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-bg text-text p-4 sm:p-6">
      <header className="flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="my-auto py-8">
        <Suspense fallback={<div className="max-w-md mx-auto h-96 bg-surface border border-border rounded-lg animate-pulse" />}>
          <AuthForm initialMode="login" />
        </Suspense>
      </main>

      <footer className="text-center text-xs text-text-muted py-4">
        &copy; {new Date().getFullYear()} CodeMentor AI. Built for comprehension.
      </footer>
    </div>
  );
}
