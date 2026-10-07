'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, FileCode2, HelpCircle } from 'lucide-react';
import { Dialog } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { LANGUAGE_DISPLAY_NAMES, SupportedLanguage } from '../../lib/constants';

export interface HistoryItemData {
  id: string;
  kind: 'analysis' | 'hint';
  title: string;
  language: SupportedLanguage;
  mistakeTags: string[];
  summary: string;
  createdAt: string;
}

export interface HistoryItemProps {
  item: HistoryItemData;
  onDelete: (id: string) => Promise<void>;
}

export function HistoryItem({ item, onDelete }: HistoryItemProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(item.id);
    } catch {
      // Handle error
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <>
      <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-DEFAULT hover:border-border-control hover:bg-surface-hover transition-colors group">
        <Link href={`/app/analysis/${item.id}`} className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-[11px] px-2 py-0.5 rounded-sm font-semibold uppercase tracking-wider ${
                item.kind === 'analysis'
                  ? 'bg-accent-tint text-accent-strong border border-accent/20'
                  : 'bg-surface-muted text-text-muted border border-border'
              }`}
            >
              {item.kind === 'analysis' ? (
                <span className="flex items-center gap-1">
                  <FileCode2 className="w-3 h-3" /> Analysis
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <HelpCircle className="w-3 h-3" /> Hint Session
                </span>
              )}
            </span>

            <span className="text-xs font-mono text-text-muted font-medium">
              {LANGUAGE_DISPLAY_NAMES[item.language] || item.language}
            </span>

            <span className="text-xs text-text-muted ml-auto font-mono">{formattedDate}</span>
          </div>

          <h3 className="text-sm font-semibold text-text group-hover:text-accent-strong truncate mb-1">
            {item.title}
          </h3>

          <p className="text-xs text-text-muted line-clamp-1 mb-2">{item.summary}</p>

          {item.mistakeTags.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              {item.mistakeTags.map((tag) => (
                <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded-xs bg-surface-muted text-text">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowConfirm(true);
          }}
          className="text-text-muted hover:text-semantic-error opacity-60 group-hover:opacity-100 transition-opacity"
          aria-label="Delete analysis"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <Dialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Delete Analysis"
        description="Are you sure you want to delete this analysis? This action cannot be undone."
      >
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="secondary" size="sm" onClick={() => setShowConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" isLoading={isDeleting} onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </>
  );
}
