'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Code2, History, Layout, User } from 'lucide-react';
import { clsx } from 'clsx';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isWorkspace = pathname === '/app';
  const isHistory = pathname === '/app/history';
  const isAccount = pathname === '/app/account';

  return (
    <div className="min-h-screen flex flex-col bg-bg text-text">
      {/* Authenticated Top Bar Shell (56px / h-14) */}
      <header className="h-14 px-6 border-b border-border bg-surface flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-6">
          <Link href="/app" className="flex items-center gap-2 font-bold text-text hover:opacity-90">
            <div className="w-7 h-7 rounded-DEFAULT bg-accent-strong text-on-accent flex items-center justify-center font-mono text-xs">
              <Code2 className="w-4 h-4" />
            </div>
            <span className="text-sm">CodeMentor AI</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/app"
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-DEFAULT text-xs font-semibold transition-colors focus-visible:outline',
                isWorkspace
                  ? 'bg-accent-tint text-accent-strong border-b-2 border-accent'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover'
              )}
            >
              <Layout className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>

            <Link
              href="/app/history"
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-DEFAULT text-xs font-semibold transition-colors focus-visible:outline',
                isHistory
                  ? 'bg-accent-tint text-accent-strong border-b-2 border-accent'
                  : 'text-text-muted hover:text-text hover:bg-surface-hover'
              )}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link
            href="/app/account"
            className={clsx(
              'rounded-full focus-visible:outline transition-opacity hover:opacity-85',
              isAccount && 'ring-2 ring-accent'
            )}
            title="Account Settings"
          >
            <div className="w-8 h-8 rounded-full bg-accent-tint text-accent-strong flex items-center justify-center font-bold text-xs">
              <User className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </header>

      {/* App Main Workspace Surface */}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
