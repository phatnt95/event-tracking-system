/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { FeedType, FeedResponse } from '@baby-tracker/shared-types';
import { apiFetch } from '../lib/api';
import { Droplets, Loader2, Save, X } from 'lucide-react';

interface FeedFormModalProps {
  babyId: string;
  initialFeed?: FeedResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FeedFormModal({
  babyId,
  initialFeed,
  onClose,
  onSuccess,
}: FeedFormModalProps) {
  const [feedType, setFeedType] = useState<FeedType>(
    initialFeed?.feedType || FeedType.FORMULA,
  );
  const [occurredAt, setOccurredAt] = useState<string>(() => {
    if (initialFeed?.occurredAt) {
      const date = new Date(initialFeed.occurredAt);
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    }
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });
  const [note, setNote] = useState(initialFeed?.note || '');
  const [leftDuration, setLeftDuration] = useState(
    initialFeed?.leftDuration ? String(initialFeed.leftDuration) : '',
  );
  const [rightDuration, setRightDuration] = useState(
    initialFeed?.rightDuration ? String(initialFeed.rightDuration) : '',
  );
  const [preparedVolume, setPreparedVolume] = useState(
    initialFeed?.preparedVolume ? String(initialFeed.preparedVolume) : '',
  );
  const [consumedVolume, setConsumedVolume] = useState(
    initialFeed?.consumedVolume ? String(initialFeed.consumedVolume) : '',
  );
  const [brand, setBrand] = useState(initialFeed?.brand || '');
  const [stage, setStage] = useState(initialFeed?.stage || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation: consumedVolume <= preparedVolume
    const prep = preparedVolume ? parseFloat(preparedVolume) : undefined;
    const cons = consumedVolume ? parseFloat(consumedVolume) : undefined;

    if (prep !== undefined && cons !== undefined && cons > prep) {
      setError('Consumed volume cannot exceed prepared volume');
      return;
    }

    setLoading(true);

    try {
      const payload: any = {
        feedType,
        occurredAt: new Date(occurredAt).toISOString(),
        note: note.trim() ? note : undefined,
      };

      if (feedType === FeedType.BREASTFEEDING) {
        if (leftDuration) payload.leftDuration = parseFloat(leftDuration);
        if (rightDuration) payload.rightDuration = parseFloat(rightDuration);
      } else if (
        feedType === FeedType.BREAST_MILK_BOTTLE ||
        feedType === FeedType.FORMULA
      ) {
        if (prep !== undefined) payload.preparedVolume = prep;
        if (cons !== undefined) payload.consumedVolume = cons;

        if (feedType === FeedType.FORMULA) {
          if (brand.trim()) payload.brand = brand.trim();
          if (stage.trim()) payload.stage = stage.trim();
        }
      }

      if (initialFeed) {
        await apiFetch(`/babies/${babyId}/feeds/${initialFeed.eventId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/babies/${babyId}/feeds`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save feed log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
          <div className="flex items-center space-x-3">
            <div className="bg-orange-50 dark:bg-orange-950/20 text-orange-500 p-2.5 rounded-2xl">
              <Droplets className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
                {initialFeed ? 'Edit Feed Log' : 'Log Feed Activity'}
              </h3>
              <p className="text-xs text-neutral-500">
                Track breastfeeding, bottle milk, or formula feeding.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-xl transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Feed Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Feed Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: FeedType.BREASTFEEDING, label: 'Nursing' },
                { type: FeedType.BREAST_MILK_BOTTLE, label: 'Breast Milk' },
                { type: FeedType.FORMULA, label: 'Formula' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setFeedType(item.type)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    feedType === item.type
                      ? 'border-[var(--primary)] bg-orange-50 text-[var(--primary)] dark:bg-orange-950/20'
                      : 'border-[var(--border)] text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Occurred At Timestamp */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Time Occurred
            </label>
            <input
              type="datetime-local"
              required
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
            />
          </div>

          {/* Conditional Fields based on FeedType */}
          {feedType === FeedType.BREASTFEEDING && (
            <div className="grid grid-cols-2 gap-4 bg-neutral-50/50 dark:bg-neutral-900/30 p-4 rounded-2xl border border-[var(--border)]">
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Left Side (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 15"
                  value={leftDuration}
                  onChange={(e) => setLeftDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Right Side (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 10"
                  value={rightDuration}
                  onChange={(e) => setRightDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>
            </div>
          )}

          {(feedType === FeedType.BREAST_MILK_BOTTLE ||
            feedType === FeedType.FORMULA) && (
            <div className="space-y-4 bg-neutral-50/50 dark:bg-neutral-900/30 p-4 rounded-2xl border border-[var(--border)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Prepared Volume (ml)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 150"
                    value={preparedVolume}
                    onChange={(e) => setPreparedVolume(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Consumed Volume (ml)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 120"
                    value={consumedVolume}
                    onChange={(e) => setConsumedVolume(e.target.value)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  />
                </div>
              </div>

              {feedType === FeedType.FORMULA && (
                <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Formula Brand
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Similac / Enfamil"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                      Stage
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Stage 1"
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Notes
            </label>
            <textarea
              rows={2}
              placeholder="Optional notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
            />
          </div>

          <div className="flex space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 border border-[var(--border)] rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors shadow-md"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save Feed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
