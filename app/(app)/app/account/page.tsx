'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { User, Shield, AlertTriangle, Check, LogOut } from 'lucide-react';
import { signOut } from '@/lib/auth-client';

export const dynamic = 'force-dynamic';

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const [storeCode, setStoreCode] = useState(true);
  const [updatingStoreCode, setUpdatingStoreCode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch('/api/account');
        const json = await res.json();
        if (!res.ok || !json.ok) throw new Error(json?.error?.message || 'Failed to load account details');
        setData(json.data);
        setStoreCode(json.data.settings.storeCode);
      } catch (err: any) {
        setError(err.message || 'Error loading account');
      } finally {
        setLoading(false);
      }
    }
    loadAccount();
  }, []);

  const handleToggleStoreCode = async () => {
    const nextVal = !storeCode;
    setStoreCode(nextVal);
    setUpdatingStoreCode(true);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeCode: nextVal }),
      });
      if (res.ok) {
        setToastMessage('Settings updated successfully.');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch {
      setStoreCode(!nextVal); // Revert on failure
    } finally {
      setUpdatingStoreCode(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmInput !== 'DELETE') return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirm: 'DELETE' }),
      });
      if (res.ok) {
        window.location.href = '/';
      }
    } catch {
      // Error handling
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-2xl mx-auto w-full flex flex-col gap-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-xl mx-auto w-full">
        <ErrorState message={error || 'Failed to load account'} />
      </div>
    );
  }

  const { user, usage } = data;

  return (
    <div className="max-w-3xl mx-auto w-full p-6 flex flex-col gap-8 text-text">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      {toastMessage && (
        <div className="p-3 bg-semantic-success/10 border border-semantic-success/20 text-semantic-success text-xs font-semibold rounded-DEFAULT flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Profile Section */}
      <section className="flex flex-col gap-3 pb-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Profile</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              await signOut();
              window.location.href = '/login';
            }}
            className="text-xs gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </Button>
        </div>
        <div className="flex items-center gap-4 pt-1">
          <div className="w-12 h-12 rounded-full bg-accent-tint text-accent-strong flex items-center justify-center font-bold text-lg">
            {user.name?.charAt(0) || 'U'}
          </div>
          <div>
            <h3 className="text-base font-semibold text-text">{user.name}</h3>
            <p className="text-xs text-text-muted">{user.email} · {user.provider} sign-in</p>
          </div>
        </div>
      </section>

      {/* 2. Usage Today Section */}
      <section className="flex flex-col gap-3 pb-6 border-b border-border">
        <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider">Usage Today</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-surface border border-border rounded-DEFAULT">
            <span className="text-xs text-text-muted block">Analyses Used</span>
            <span className="text-lg font-bold text-text">{usage.analysesUsed} / {usage.analysesLimit}</span>
          </div>
          <div className="p-3 bg-surface border border-border rounded-DEFAULT">
            <span className="text-xs text-text-muted block">Hint Requests Used</span>
            <span className="text-lg font-bold text-text">{usage.hintsUsed} / {usage.hintsLimit}</span>
          </div>
        </div>
        <p className="text-xs text-text-muted italic">Quotas reset daily at 00:00 UTC.</p>
      </section>

      {/* 3. Privacy Settings */}
      <section className="flex flex-col gap-3 pb-6 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
          <Shield className="w-4 h-4" />
          <span>Privacy</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-DEFAULT">
          <div>
            <h3 className="text-sm font-semibold text-text mb-1">Store my code with saved analyses</h3>
            <p className="text-xs text-text-muted max-w-md">
              When disabled, original code snippets are omitted from database storage and caching.
            </p>
          </div>

          <label className="relative inline-flex items-center shrink-0 cursor-pointer ml-4">
            <input
              type="checkbox"
              checked={storeCode}
              onChange={handleToggleStoreCode}
              disabled={updatingStoreCode}
              className="sr-only peer"
            />
            <div className="w-10 h-6 bg-surface-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-strong"></div>
          </label>
        </div>
      </section>

      {/* 4. Danger Zone */}
      <section className="flex flex-col gap-3 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-semantic-error uppercase tracking-wider">
          <AlertTriangle className="w-4 h-4" />
          <span>Danger Zone</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-surface border border-semantic-error/20 rounded-DEFAULT">
          <div>
            <h3 className="text-sm font-semibold text-text mb-1">Delete Account</h3>
            <p className="text-xs text-text-muted">
              Permanently delete your account, session data, and all saved analyses.
            </p>
          </div>
          <Button variant="danger" size="sm" onClick={() => setDeleteModalOpen(true)}>
            Delete Account
          </Button>
        </div>
      </section>

      {/* Account Delete Confirmation Modal */}
      <Dialog
        open={deleteModalOpen}
        onOpenChange={(open: boolean) => {
          setDeleteModalOpen(open);
          if (!open) setConfirmInput('');
        }}
        title="Delete Account Permanently"
        description="This action is irreversible. Type DELETE to confirm deletion."
      >
        <div className="flex flex-col gap-4 mt-2">
          <Input
            placeholder="Type DELETE"
            value={confirmInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmInput(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={confirmInput !== 'DELETE'}
              isLoading={isDeleting}
              onClick={handleDeleteAccount}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
