'use client';

import React, { useState } from 'react';
import { GrowthResponse, GrowthRecordHistoryItem } from '@baby-tracker/shared-types';
import { apiFetch, getErrorMessage } from '../lib/api';
import { TrendingUp, Loader2, Save, X } from 'lucide-react';

interface GrowthFormModalProps {
  babyId: string;
  initialGrowth?: GrowthResponse | GrowthRecordHistoryItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function GrowthFormModal({
  babyId,
  initialGrowth,
  onClose,
  onSuccess,
}: GrowthFormModalProps) {
  const isEditing = Boolean(initialGrowth);

  const [weightKg, setWeightKg] = useState<string>(
    initialGrowth?.weightKg ? String(initialGrowth.weightKg) : '',
  );
  const [occurredAt, setOccurredAt] = useState<string>(() => {
    const rawDate =
      (initialGrowth && 'occurredAt' in initialGrowth ? initialGrowth.occurredAt : null) ||
      initialGrowth?.measuredAt;
    if (rawDate) {
      const date = new Date(rawDate);
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, 16);
    }
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  });
  const [note, setNote] = useState<string>(
    (initialGrowth && 'note' in initialGrowth ? initialGrowth.note : null) ||
      (initialGrowth && 'notes' in initialGrowth ? initialGrowth.notes : '') ||
      '',
  );
  const [heightCm, setHeightCm] = useState<string>(
    initialGrowth?.heightCm ? String(initialGrowth.heightCm) : '',
  );
  const [headCircumferenceCm, setHeadCircumferenceCm] = useState<string>(
    initialGrowth?.headCircumferenceCm ? String(initialGrowth.headCircumferenceCm) : '',
  );
  const [measuredBy, setMeasuredBy] = useState<string>(
    (initialGrowth && 'measuredBy' in initialGrowth && initialGrowth.measuredBy) || '',
  );
  const [location, setLocation] = useState<string>(
    (initialGrowth && 'location' in initialGrowth && initialGrowth.location) || '',
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const parsedWeight = parseFloat(weightKg);
    if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      setError('Weight must be a positive number greater than 0 kg');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        weightKg: parsedWeight,
        occurredAt: new Date(occurredAt).toISOString(),
        note: note.trim() || undefined,
        heightCm: heightCm ? parseFloat(heightCm) : undefined,
        headCircumferenceCm: headCircumferenceCm ? parseFloat(headCircumferenceCm) : undefined,
        measuredBy: measuredBy.trim() || undefined,
        location: location.trim() || undefined,
      };

      if (isEditing && initialGrowth) {
        const targetId = initialGrowth.eventId || initialGrowth.id;
        await apiFetch(`/growth/${targetId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/babies/${babyId}/growth`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save growth record'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[var(--card-bg)] border border-[var(--border)] w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden my-8">
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                {isEditing ? 'Edit Weight Record' : 'Record Weight & Growth'}
              </h3>
              <p className="text-xs text-neutral-500">Track physical growth over time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm rounded-2xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Weight (kg) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="e.g. 5.2"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-[var(--border)] rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <span className="absolute right-4 top-3.5 text-sm font-semibold text-neutral-400">
                kg
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Measurement Date & Time <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              value={occurredAt}
              onChange={(e) => setOccurredAt(e.target.value)}
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                Height (cm) <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="e.g. 58.5"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                Head Circ. (cm) <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                value={headCircumferenceCm}
                onChange={(e) => setHeadCircumferenceCm(e.target.value)}
                placeholder="e.g. 38.0"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                Measured By <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={measuredBy}
                onChange={(e) => setMeasuredBy(e.target.value)}
                placeholder="e.g. Dr. Smith"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
                Location <span className="text-neutral-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. City Hospital"
                className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-2">
              Notes
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Routine checkup weight measurement"
              className="w-full px-4 py-3 bg-neutral-50 dark:bg-neutral-900 border border-[var(--border)] rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl border border-[var(--border)] text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-500/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isEditing ? 'Update Record' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
