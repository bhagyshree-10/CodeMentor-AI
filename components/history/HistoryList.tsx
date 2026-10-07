'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { HistoryItem, HistoryItemData } from './HistoryItem';
import { PatternChips, TagCount } from './PatternChips';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';
import { ErrorState } from '../ui/ErrorState';
import { SUPPORTED_LANGUAGES, LANGUAGE_DISPLAY_NAMES, SupportedLanguage } from '../../lib/constants';

export function HistoryList() {
  const [items, setItems] = useState<HistoryItemData[]>([]);
  const [topTags, setTopTags] = useState<TagCount[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [kindFilter, setKindFilter] = useState<'all' | 'analysis' | 'hint'>('all');
  const [langFilter, setLangFilter] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | undefined>(undefined);

  const fetchHistory = useCallback(
    async (cursor?: string) => {
      try {
        if (!cursor) setLoading(true);
        else setLoadingMore(true);
        setError(null);

        const params = new URLSearchParams();
        if (cursor) params.set('cursor', cursor);
        if (kindFilter !== 'all') params.set('kind', kindFilter);
        if (langFilter !== 'all') params.set('language', langFilter);
        if (selectedTag) params.set('tag', selectedTag);

        const res = await fetch(`/api/analyses?${params.toString()}`);
        const data = await res.json();

        if (!res.ok || !data.ok) {
          throw new Error(data?.error?.message || 'Failed to fetch history');
        }

        if (cursor) {
          setItems((prev) => [...prev, ...data.data.items]);
        } else {
          setItems(data.data.items);
          if (data.data.topTags) {
            setTopTags(data.data.topTags);
          }
        }
        setNextCursor(data.data.nextCursor);
      } catch (err: any) {
        setError(err.message || 'Failed to load history');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [kindFilter, langFilter, selectedTag]
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/analyses/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const langOptions = [
    { value: 'all', label: 'All Languages' },
    ...SUPPORTED_LANGUAGES.map((l) => ({ value: l, label: LANGUAGE_DISPLAY_NAMES[l] })),
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text">Analysis History</h1>
      </div>

      {/* Filters Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap pb-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={kindFilter === 'all' ? 'primary' : 'ghost'}
            onClick={() => setKindFilter('all')}
          >
            All
          </Button>
          <Button
            size="sm"
            variant={kindFilter === 'analysis' ? 'primary' : 'ghost'}
            onClick={() => setKindFilter('analysis')}
          >
            Analyses
          </Button>
          <Button
            size="sm"
            variant={kindFilter === 'hint' ? 'primary' : 'ghost'}
            onClick={() => setKindFilter('hint')}
          >
            Hint Sessions
          </Button>
        </div>

        <Select
          value={langFilter}
          onValueChange={setLangFilter}
          options={langOptions}
          className="w-44"
        />
      </div>

      {/* Top Pattern Filter Chips */}
      <PatternChips topTags={topTags} selectedTag={selectedTag} onSelectTag={setSelectedTag} />

      {/* Content States */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <Skeleton key={n} className="h-24 w-full" />
          ))}
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchHistory()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          description="Analyze your first code snippet or start a DSA hint ladder session to build your learning history."
        />
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <HistoryItem key={item.id} item={item} onDelete={handleDelete} />
          ))}

          {nextCursor && (
            <div className="flex justify-center pt-4">
              <Button
                variant="secondary"
                size="md"
                isLoading={loadingMore}
                onClick={() => fetchHistory(nextCursor)}
              >
                Load More
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
