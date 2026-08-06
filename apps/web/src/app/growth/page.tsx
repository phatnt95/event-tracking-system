'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BabyResponse,
  GrowthRecordHistoryItem,
  LatestGrowthResponse,
} from '@baby-tracker/shared-types';
import Header from '../../components/Header';
import GrowthFormModal from '../../components/GrowthFormModal';
import { apiFetch, getErrorMessage } from '../../lib/api';
import {
  TrendingUp,
  Plus,
  Weight,
  Calendar,
  Pencil,
  Trash2,
  Loader2,
  Baby as BabyIcon,
} from 'lucide-react';

export default function GrowthPage() {
  const [babies, setBabies] = useState<BabyResponse[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [latestGrowth, setLatestGrowth] = useState<LatestGrowthResponse | null>(null);
  const [growthHistory, setGrowthHistory] = useState<GrowthRecordHistoryItem[]>([]);

  const [isLoadingBabies, setIsLoadingBabies] = useState(true);
  const [isLoadingGrowth, setIsLoadingGrowth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<GrowthRecordHistoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selectedBaby = babies.find((b) => b.id === selectedBabyId) ?? null;

  const loadBabies = useCallback(async () => {
    setIsLoadingBabies(true);
    setError(null);
    try {
      const data = await apiFetch<BabyResponse[]>('/babies');
      setBabies(data);
      if (data.length > 0) {
        setSelectedBabyId((prev) => prev || data[0].id);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load baby profiles.'));
    } finally {
      setIsLoadingBabies(false);
    }
  }, []);

  const loadGrowthData = useCallback(async (babyId: string) => {
    setIsLoadingGrowth(true);
    try {
      const [latest, history] = await Promise.all([
        apiFetch<LatestGrowthResponse | null>(`/babies/${babyId}/growth/latest`),
        apiFetch<GrowthRecordHistoryItem[]>(`/babies/${babyId}/growth`),
      ]);
      setLatestGrowth(latest);
      setGrowthHistory(history);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load growth data.'));
    } finally {
      setIsLoadingGrowth(false);
    }
  }, []);

  useEffect(() => {
    void loadBabies();
  }, [loadBabies]);

  useEffect(() => {
    if (selectedBabyId) {
      void loadGrowthData(selectedBabyId);
    }
  }, [selectedBabyId, loadGrowthData]);

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this weight measurement?')) return;
    setDeletingId(eventId);
    try {
      await apiFetch(`/growth/${eventId}`, { method: 'DELETE' });
      if (selectedBabyId) {
        void loadGrowthData(selectedBabyId);
      }
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to delete growth record'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleOpenCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: GrowthRecordHistoryItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-12 transition-colors duration-200 font-sans">
      <Header />

      <main className="max-w-5xl mx-auto px-4 pt-8 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-white flex items-center gap-2.5">
              <TrendingUp className="h-7 w-7 text-blue-500" />
              Growth & Weight Tracking
            </h1>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Record weight measurements and monitor growth over time
            </p>
          </div>

          {selectedBabyId && (
            <button
              onClick={handleOpenCreate}
              className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md shadow-blue-500/20 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Record Weight</span>
            </button>
          )}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:border-red-800/50 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Baby Selector Tabs */}
        <section className="mb-8">
          {isLoadingBabies ? (
            <div className="h-12 w-48 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900" />
          ) : babies.length === 0 ? (
            <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-8 text-center">
              <p className="text-sm text-neutral-500">
                Please add a baby profile to start tracking growth.
              </p>
            </div>
          ) : (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {babies.map((baby) => (
                <button
                  key={baby.id}
                  onClick={() => setSelectedBabyId(baby.id)}
                  className={`flex items-center space-x-2 px-5 py-2.5 rounded-2xl border text-sm font-semibold transition ${
                    selectedBabyId === baby.id
                      ? 'border-blue-500 bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 shadow-sm'
                      : 'border-[var(--border)] bg-[var(--card-bg)] text-neutral-600 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800'
                  }`}
                >
                  <BabyIcon className="h-4 w-4" />
                  <span>{baby.name}</span>
                </button>
              ))}
            </div>
          )}
        </section>

        {selectedBabyId && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                  <Weight className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Latest Weight
                  </span>
                  <div className="text-2xl font-bold text-neutral-800 dark:text-white">
                    {latestGrowth ? `${latestGrowth.weightKg.toFixed(2)} kg` : '—'}
                  </div>
                  {latestGrowth && (
                    <span className="text-xs text-neutral-500">
                      {new Date(latestGrowth.measuredAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Baby Age
                  </span>
                  <div className="text-2xl font-bold text-neutral-800 dark:text-white">
                    {latestGrowth
                      ? `${latestGrowth.ageWeeks} Weeks`
                      : selectedBaby
                        ? `${Math.max(0, Math.floor((Date.now() - new Date(selectedBaby.birthday).getTime()) / (1000 * 60 * 60 * 24 * 7)))} Weeks`
                        : '—'}
                  </div>
                  <span className="text-xs text-neutral-500">Auto-calculated</span>
                </div>
              </div>

              <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm flex items-center space-x-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    Total Records
                  </span>
                  <div className="text-2xl font-bold text-neutral-800 dark:text-white">
                    {growthHistory.length}
                  </div>
                  <span className="text-xs text-neutral-500">Measurements</span>
                </div>
              </div>
            </div>

            {/* Measurement History Table */}
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500 mb-6">
                Measurement History
              </h2>

              {isLoadingGrowth ? (
                <div className="py-12 text-center text-sm text-neutral-500 flex items-center justify-center space-x-2">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                  <span>Loading growth records…</span>
                </div>
              ) : growthHistory.length === 0 ? (
                <div className="py-12 text-center text-neutral-500">
                  <p className="text-sm">No weight measurements recorded yet.</p>
                  <button
                    onClick={handleOpenCreate}
                    className="mt-4 inline-flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Record First Weight</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-[var(--border)] text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                        <th className="pb-3 px-3">Date</th>
                        <th className="pb-3 px-3">Age</th>
                        <th className="pb-3 px-3">Weight</th>
                        <th className="pb-3 px-3">Height</th>
                        <th className="pb-3 px-3">Head Circ.</th>
                        <th className="pb-3 px-3">Notes</th>
                        <th className="pb-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {growthHistory.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition"
                        >
                          <td className="py-4 px-3 font-semibold text-neutral-800 dark:text-white">
                            {new Date(item.measuredAt).toLocaleDateString([], {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="py-4 px-3 text-neutral-600 dark:text-neutral-300">
                            <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
                              {item.ageWeeks} Weeks
                            </span>
                          </td>
                          <td className="py-4 px-3 font-bold text-neutral-800 dark:text-white text-base">
                            {item.weightKg.toFixed(2)} kg
                          </td>
                          <td className="py-4 px-3 text-neutral-600 dark:text-neutral-400">
                            {item.heightCm ? `${item.heightCm} cm` : '—'}
                          </td>
                          <td className="py-4 px-3 text-neutral-600 dark:text-neutral-400">
                            {item.headCircumferenceCm ? `${item.headCircumferenceCm} cm` : '—'}
                          </td>
                          <td className="py-4 px-3 text-neutral-500 dark:text-neutral-400 max-w-xs truncate">
                            {item.notes || '—'}
                          </td>
                          <td className="py-4 px-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition"
                                title="Edit"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.eventId || item.id)}
                                disabled={deletingId === (item.eventId || item.id)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {isModalOpen && selectedBabyId && (
        <GrowthFormModal
          babyId={selectedBabyId}
          initialGrowth={editingItem}
          onClose={() => {
            setIsModalOpen(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            if (selectedBabyId) {
              void loadGrowthData(selectedBabyId);
            }
          }}
        />
      )}
    </div>
  );
}
