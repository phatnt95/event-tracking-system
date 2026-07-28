/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
  DiaperStatus,
  PoopColor,
  PoopConsistency,
  PoopAmount,
  DiaperResponse,
} from '@baby-tracker/shared-types';
import { apiFetch } from '../lib/api';
import { Activity, Loader2, Save, X } from 'lucide-react';

interface DiaperFormModalProps {
  babyId: string;
  initialDiaper?: DiaperResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DiaperFormModal({
  babyId,
  initialDiaper,
  onClose,
  onSuccess,
}: DiaperFormModalProps) {
  const [status, setStatus] = useState<DiaperStatus>(
    initialDiaper?.status || DiaperStatus.PEE,
  );
  const [occurredAt, setOccurredAt] = useState<string>(() => {
    if (initialDiaper?.occurredAt) {
      const date = new Date(initialDiaper.occurredAt);
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    }
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });
  const [note, setNote] = useState(initialDiaper?.note || '');
  const [poopColor, setPoopColor] = useState<PoopColor | ''>(
    initialDiaper?.poopColor || '',
  );
  const [poopConsistency, setPoopConsistency] = useState<PoopConsistency | ''>(
    initialDiaper?.poopConsistency || '',
  );
  const [poopAmount, setPoopAmount] = useState<PoopAmount | ''>(
    initialDiaper?.poopAmount || '',
  );
  const [hasBlood, setHasBlood] = useState(initialDiaper?.hasBlood || false);
  const [hasMucus, setHasMucus] = useState(initialDiaper?.hasMucus || false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload: any = {
        status,
        occurredAt: new Date(occurredAt).toISOString(),
        note: note.trim() ? note : undefined,
      };

      if (status === DiaperStatus.POOP || status === DiaperStatus.BOTH) {
        if (poopColor) payload.poopColor = poopColor;
        if (poopConsistency) payload.poopConsistency = poopConsistency;
        if (poopAmount) payload.poopAmount = poopAmount;
        payload.hasBlood = hasBlood;
        payload.hasMucus = hasMucus;
      }

      if (initialDiaper) {
        await apiFetch(`/babies/${babyId}/diapers/${initialDiaper.eventId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/babies/${babyId}/diapers`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save diaper log');
    } finally {
      setLoading(false);
    }
  };

  const showPoopOptions =
    status === DiaperStatus.POOP || status === DiaperStatus.BOTH;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 p-2.5 rounded-2xl">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
                {initialDiaper ? 'Edit Diaper Log' : 'Log Diaper Change'}
              </h3>
              <p className="text-xs text-neutral-500">
                Track pee, poop, and related details.
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

          {/* Diaper Status Selector */}
          <div>
            <label className="block text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">
              Status
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { type: DiaperStatus.PEE, label: 'Pee Only' },
                { type: DiaperStatus.POOP, label: 'Poop Only' },
                { type: DiaperStatus.BOTH, label: 'Both' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setStatus(item.type)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    status === item.type
                      ? 'border-[var(--primary)] bg-emerald-50 text-[var(--primary)] dark:bg-emerald-950/20'
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

          {/* Conditional Fields based on Poop */}
          {showPoopOptions && (
            <div className="space-y-4 bg-neutral-50/50 dark:bg-neutral-900/30 p-4 rounded-2xl border border-[var(--border)]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Poop Color
                  </label>
                  <select
                    value={poopColor}
                    onChange={(e) => setPoopColor(e.target.value as PoopColor)}
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  >
                    <option value="">Select color...</option>
                    {Object.values(PoopColor).map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0) + c.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                    Poop Consistency
                  </label>
                  <select
                    value={poopConsistency}
                    onChange={(e) =>
                      setPoopConsistency(e.target.value as PoopConsistency)
                    }
                    className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                  >
                    <option value="">Select consistency...</option>
                    {Object.values(PoopConsistency).map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0) + c.slice(1).toLowerCase().replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">
                  Amount
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.values(PoopAmount).map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setPoopAmount(amount)}
                      className={`py-1.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        poopAmount === amount
                          ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                          : 'border-[var(--border)] text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800'
                      }`}
                    >
                      {amount.charAt(0) + amount.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4 border-t border-[var(--border)] pt-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasBlood}
                    onChange={(e) => setHasBlood(e.target.checked)}
                    className="rounded border-[var(--border)] text-red-500 focus:ring-red-500 bg-transparent"
                  />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Blood
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMucus}
                    onChange={(e) => setHasMucus(e.target.checked)}
                    className="rounded border-[var(--border)] text-yellow-500 focus:ring-yellow-500 bg-transparent"
                  />
                  <span className="text-sm font-medium text-yellow-600 dark:text-yellow-500">
                    Mucus
                  </span>
                </label>
              </div>
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
                  <span>Save Diaper Log</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
