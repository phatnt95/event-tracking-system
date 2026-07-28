/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '../../../../components/Header';
import FeedFormModal from '../../../../components/FeedFormModal';
import DiaperFormModal from '../../../../components/DiaperFormModal';
import { apiFetch } from '../../../../lib/api';
import { EventResponse, EventType, BabyResponse } from '@baby-tracker/shared-types';
import {
  Baby,
  ArrowLeft,
  Clock,
  Plus,
  Loader2,
  Trash2,
  Droplets,
  Activity,
  Moon,
  Pill,
  TrendingUp,
  Syringe,
  Filter,
} from 'lucide-react';

export default function BabyEventsPage() {
  const params = useParams();
  const babyId = params?.id as string;

  const [baby, setBaby] = useState<BabyResponse | null>(null);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Feed Modal state
  const [showFeedModal, setShowFeedModal] = useState(false);
  // Diaper Modal state
  const [showDiaperModal, setShowDiaperModal] = useState(false);
  // New Event Form state
  const [showLogModal, setShowLogModal] = useState(false);
  const [newType, setNewType] = useState<EventType>(EventType.FEED);
  const [newOccurredAt, setNewOccurredAt] = useState('');
  const [newNote, setNewNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBabyAndEvents = useCallback(async () => {
    if (!babyId) return;
    try {
      setLoading(true);
      const [babyData, eventsData] = await Promise.all([
        apiFetch<BabyResponse>(`/babies/${babyId}`),
        apiFetch<EventResponse[]>(
          `/babies/${babyId}/events${filterType !== 'ALL' ? `?type=${filterType}` : ''}`,
        ),
      ]);
      setBaby(babyData);
      setEvents(eventsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load events timeline');
    } finally {
      setLoading(false);
    }
  }, [babyId, filterType]);

  useEffect(() => {
    fetchBabyAndEvents();
  }, [fetchBabyAndEvents]);

  // Default occurredAt timestamp for datetime-local input
  const getNowLocal = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offset).toISOString().slice(0, 16);
  };

  const handleOpenModal = (type?: EventType) => {
    if (type === EventType.FEED) {
      setShowFeedModal(true);
      return;
    }
    if (type === EventType.DIAPER) {
      setShowDiaperModal(true);
      return;
    }
    if (type) setNewType(type);
    setNewOccurredAt(getNowLocal());
    setNewNote('');
    setShowLogModal(true);
  };


  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiFetch(`/babies/${babyId}/events`, {
        method: 'POST',
        body: JSON.stringify({
          type: newType,
          occurredAt: new Date(newOccurredAt).toISOString(),
          note: newNote,
        }),
      });
      setShowLogModal(false);
      fetchBabyAndEvents();
    } catch (err: any) {
      alert(err.message || 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event log?')) return;
    try {
      await apiFetch(`/babies/${babyId}/events/${eventId}`, {
        method: 'DELETE',
      });
      setEvents((prev) => prev.filter((ev) => ev.id !== eventId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case EventType.FEED:
        return <Droplets className="h-4 w-4 text-orange-500" />;
      case EventType.DIAPER:
        return <Activity className="h-4 w-4 text-emerald-500" />;
      case EventType.SLEEP:
        return <Moon className="h-4 w-4 text-indigo-500" />;
      case EventType.MEDICINE:
        return <Pill className="h-4 w-4 text-purple-500" />;
      case EventType.GROWTH:
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case EventType.VACCINE:
        return <Syringe className="h-4 w-4 text-pink-500" />;
      default:
        return <Baby className="h-4 w-4 text-neutral-500" />;
    }
  };

  const getEventBadgeColor = (type: EventType) => {
    switch (type) {
      case EventType.FEED:
        return 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200/50';
      case EventType.DIAPER:
        return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-200/50';
      case EventType.SLEEP:
        return 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-200/50';
      case EventType.MEDICINE:
        return 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400 border-purple-200/50';
      case EventType.GROWTH:
        return 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 border-blue-200/50';
      case EventType.VACCINE:
        return 'bg-pink-50 text-pink-600 dark:bg-pink-950/30 dark:text-pink-400 border-pink-200/50';
      default:
        return 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans pb-16">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-8 md:px-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-neutral-500 mb-6">
          <Link
            href="/babies"
            className="hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors flex items-center space-x-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Babies</span>
          </Link>

          <span>/</span>
          {baby && (
            <Link
              href={`/babies/${babyId}`}
              className="hover:text-neutral-800 dark:hover:text-neutral-300 transition-colors font-medium text-neutral-700 dark:text-neutral-200"
            >
              {baby.name}
            </Link>
          )}
          <span>/</span>
          <span className="font-semibold text-neutral-800 dark:text-white">Events Timeline</span>
        </div>

        {/* Page Header Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-[var(--border)] gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-[var(--primary)] text-white p-3 rounded-2xl shadow-md shadow-orange-500/20">
              <Baby className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-800 dark:text-white">
                {baby ? `${baby.name}'s Timeline` : 'Activity Timeline'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                Log and monitor feeding, diaper changes, sleep, and health events.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center justify-center space-x-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2.5 rounded-2xl font-medium shadow-md shadow-orange-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            <span>Log Event</span>
          </button>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Quick Log Bar & Filters */}
        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 shadow-sm mb-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
              Quick Log Activity
            </h3>
            <div className="flex items-center space-x-2">
              <Filter className="h-3.5 w-3.5 text-neutral-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent text-xs border border-[var(--border)] rounded-xl px-2.5 py-1 text-neutral-700 dark:text-neutral-300 focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              >
                <option value="ALL">All Event Types</option>
                {Object.values(EventType).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { type: EventType.FEED, label: 'Feed', icon: Droplets, color: 'text-orange-500' },
              { type: EventType.DIAPER, label: 'Diaper', icon: Activity, color: 'text-emerald-500' },
              { type: EventType.SLEEP, label: 'Sleep', icon: Moon, color: 'text-indigo-500' },
              { type: EventType.MEDICINE, label: 'Medicine', icon: Pill, color: 'text-purple-500' },
              { type: EventType.GROWTH, label: 'Growth', icon: TrendingUp, color: 'text-blue-500' },
              { type: EventType.VACCINE, label: 'Vaccine', icon: Syringe, color: 'text-pink-500' },
            ].map((item) => (
              <button
                key={item.type}
                onClick={() => handleOpenModal(item.type)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl border border-[var(--border)] hover:border-[var(--primary)]/40 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 transition group"
              >
                <item.icon className={`h-5 w-5 ${item.color} mb-1 group-hover:scale-110 transition-transform`} />
                <span className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                  {item.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Events List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
            <p className="text-xs text-neutral-500 mt-2">Loading timeline events...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16 bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8">
            <div className="inline-flex bg-orange-50 dark:bg-orange-950/20 text-[var(--primary)] p-4 rounded-3xl mb-3">
              <Clock className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
              No events logged yet
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              Start tracking baby activities by clicking the "Log Event" button above.
            </p>
          </div>
        ) : (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-6">
              Events Activity Log ({events.length})
            </h3>

            <div className="relative border-l border-[var(--border)] ml-3 pl-6 space-y-6">
              {events.map((event) => (
                <div key={event.id} className="relative group">
                  {/* Timeline Node Dot */}
                  <div className="absolute -left-[33px] top-1 p-1.5 rounded-full border border-[var(--background)] bg-[var(--card-bg)] shadow-sm">
                    {getEventIcon(event.type)}
                  </div>

                  {/* Event Item Box */}
                  <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-[var(--border)] rounded-2xl p-4 hover:border-[var(--primary)]/40 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getEventBadgeColor(
                            event.type,
                          )}`}
                        >
                          {event.type}
                        </span>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="flex items-center text-xs text-neutral-400">
                          <Clock className="h-3.5 w-3.5 mr-1" />
                          {new Date(event.occurredAt).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </div>

                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-neutral-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          title="Delete Event Log"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {event.note && (
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-2.5 pt-2 border-t border-[var(--border)]">
                        {event.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Log Event Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex justify-between items-center pb-3 border-b border-[var(--border)]">
              <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
                Log Baby Activity
              </h3>
              <button
                onClick={() => setShowLogModal(false)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Event Type
                </label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as EventType)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                >
                  {Object.values(EventType).map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Occurred At
                </label>
                <input
                  type="datetime-local"
                  required
                  value={newOccurredAt}
                  onChange={(e) => setNewOccurredAt(e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                  placeholder="Optional notes or details..."
                  className="w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 px-4 border border-[var(--border)] rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors shadow-md"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Save Log</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Feed Form Modal */}
      {showFeedModal && (
        <FeedFormModal
          babyId={babyId}
          onClose={() => setShowFeedModal(false)}
          onSuccess={() => fetchBabyAndEvents()}
        />
      )}

      {/* Dedicated Diaper Form Modal */}
      {showDiaperModal && (
        <DiaperFormModal
          babyId={babyId}
          onClose={() => setShowDiaperModal(false)}
          onSuccess={() => fetchBabyAndEvents()}
        />
      )}
    </div>
  );
}
