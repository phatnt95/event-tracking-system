'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Activity, Baby, ChevronRight, Clock, Droplets, Moon, Plus, Weight } from 'lucide-react';
import {
  BabyResponse,
  EventResponse,
  EventTimelineResponse,
  EventType,
  Gender,
} from '@baby-tracker/shared-types';
import Header from '../components/Header';
import { apiFetch, getErrorMessage } from '../lib/api';

function formatAge(birthday: string): string {
  const birthDate = new Date(birthday);
  const today = new Date();
  let months =
    (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();

  if (today.getDate() < birthDate.getDate()) months -= 1;
  if (months <= 0) return 'Newborn';
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} old`;

  const years = Math.floor(months / 12);
  months %= 12;
  return `${years} year${years === 1 ? '' : 's'}${months ? ` ${months} mo` : ''}`;
}

function eventLabel(type: EventType): string {
  return type.charAt(0) + type.slice(1).toLowerCase();
}

export default function Home() {
  const [babies, setBabies] = useState<BabyResponse[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [isLoadingBabies, setIsLoadingBabies] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedBaby = useMemo(
    () => babies.find((baby) => baby.id === selectedBabyId) ?? null,
    [babies, selectedBabyId],
  );

  const loadBabies = useCallback(async () => {
    setIsLoadingBabies(true);
    setError(null);
    try {
      const result = await apiFetch<BabyResponse[]>('/babies');
      setBabies(result);
      setSelectedBabyId((currentId) =>
        currentId && result.some((baby) => baby.id === currentId)
          ? currentId
          : (result[0]?.id ?? null),
      );
    } catch (error: unknown) {
      setError(getErrorMessage(error, 'Failed to load baby profiles.'));
    } finally {
      setIsLoadingBabies(false);
    }
  }, []);

  const loadEvents = useCallback(async (babyId: string) => {
    setIsLoadingEvents(true);
    try {
      const result = await apiFetch<EventTimelineResponse>(`/babies/${babyId}/events?limit=10`);
      setEvents(result.items);
    } catch (error: unknown) {
      setEvents([]);
      setError(getErrorMessage(error, 'Failed to load the event timeline.'));
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    void loadBabies();
  }, [loadBabies]);

  useEffect(() => {
    if (selectedBabyId) {
      void loadEvents(selectedBabyId);
    } else {
      setEvents([]);
    }
  }, [loadEvents, selectedBabyId]);

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-12 transition-colors duration-200 font-sans">
      <Header />

      <main className="max-w-5xl mx-auto px-4 pt-8 md:px-8">
        {error && (
          <div className="mb-6 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-1">
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  Babies
                </h2>
                <Link
                  href="/babies/new"
                  className="rounded-full p-1 text-[var(--primary)] transition hover:bg-neutral-100 hover:text-[var(--primary-hover)] dark:hover:bg-neutral-800"
                  title="Add new baby profile"
                >
                  <Plus className="h-5 w-5" />
                </Link>
              </div>

              {isLoadingBabies ? (
                <div className="space-y-3">
                  {[0, 1].map((index) => (
                    <div
                      key={index}
                      className="h-20 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900"
                    />
                  ))}
                </div>
              ) : babies.length === 0 ? (
                <p className="text-sm text-neutral-500">Add a baby profile to begin tracking.</p>
              ) : (
                <div className="space-y-3">
                  {babies.map((baby) => (
                    <button
                      key={baby.id}
                      type="button"
                      onClick={() => setSelectedBabyId(baby.id)}
                      className={`flex w-full items-center justify-between rounded-2xl border p-4 text-left transition ${selectedBabyId === baby.id ? 'border-[var(--primary)] bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10' : 'border-[var(--border)] hover:bg-neutral-50 dark:hover:bg-neutral-900/50'}`}
                    >
                      <span className="flex items-center space-x-3">
                        <span
                          className={`rounded-xl p-2 ${baby.gender === Gender.MALE ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'}`}
                        >
                          <Baby className="h-5 w-5" />
                        </span>
                        <span>
                          <span className="block font-semibold">{baby.name}</span>
                          <span className="block text-xs text-neutral-500">
                            {formatAge(baby.birthday)}
                          </span>
                        </span>
                      </span>
                      {selectedBabyId === baby.id && (
                        <ChevronRight className="h-4 w-4 text-[var(--primary)]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4 rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Birth stats
              </h2>
              {selectedBaby ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col justify-center rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-900/40">
                    <span className="mb-1 flex items-center text-xs text-neutral-500">
                      <Weight className="mr-1 h-3.5 w-3.5" />
                      Weight
                    </span>
                    <strong className="text-lg">
                      {typeof selectedBaby.birthWeight === 'number'
                        ? `${selectedBaby.birthWeight} kg`
                        : '—'}
                    </strong>
                  </div>
                  <div className="flex flex-col justify-center rounded-2xl bg-neutral-50 p-3 dark:bg-neutral-900/40">
                    <span className="mb-1 flex items-center text-xs text-neutral-500">
                      <Activity className="mr-1 h-3.5 w-3.5" />
                      Height
                    </span>
                    <strong className="text-lg">
                      {typeof selectedBaby.birthHeight === 'number'
                        ? `${selectedBaby.birthHeight} cm`
                        : '—'}
                    </strong>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-neutral-500">Select a baby to view their stats.</p>
              )}
            </section>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Log activity
              </h2>
              {selectedBabyId ? (
                <div className="grid grid-cols-3 gap-4">
                  <Link
                    href={`/babies/${selectedBabyId}/events?type=${EventType.FEED}`}
                    className="flex flex-col items-center justify-center rounded-2xl border border-transparent bg-orange-50 p-4 transition hover:border-orange-200 hover:bg-orange-100 dark:bg-orange-950/20"
                  >
                    <Droplets className="mb-2 h-6 w-6 text-orange-500" />
                    <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                      Feeding
                    </span>
                  </Link>
                  <Link
                    href={`/babies/${selectedBabyId}/events?type=${EventType.DIAPER}`}
                    className="flex flex-col items-center justify-center rounded-2xl border border-transparent bg-emerald-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20"
                  >
                    <Activity className="mb-2 h-6 w-6 text-emerald-500" />
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      Diaper
                    </span>
                  </Link>
                  <Link
                    href={`/babies/${selectedBabyId}/events?type=${EventType.SLEEP}`}
                    className="flex flex-col items-center justify-center rounded-2xl border border-transparent bg-indigo-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/20"
                  >
                    <Moon className="mb-2 h-6 w-6 text-indigo-500" />
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                      Sleep
                    </span>
                  </Link>
                </div>
              ) : (
                <p className="text-sm text-neutral-500">Add a baby before logging an activity.</p>
              )}
            </section>

            <section className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm">
              <h2 className="mb-6 text-sm font-semibold uppercase tracking-wider text-neutral-500">
                Recent timeline
              </h2>
              {isLoadingEvents ? (
                <p className="text-sm text-neutral-500">Loading events…</p>
              ) : events.length === 0 ? (
                <p className="text-sm text-neutral-500">No events recorded yet.</p>
              ) : (
                <div className="relative ml-3 space-y-6 border-l border-[var(--border)] pl-6">
                  {events.map((event) => (
                    <article
                      key={event.id}
                      className="relative rounded-2xl border border-[var(--border)] bg-neutral-50/50 p-4 transition hover:border-[var(--primary)]/40 dark:bg-neutral-900/20"
                    >
                      <span
                        className={`absolute -left-[33px] top-4 rounded-full border border-[var(--background)] p-1.5 ${event.type === EventType.FEED ? 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400' : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'}`}
                      >
                        {event.type === EventType.FEED ? (
                          <Droplets className="h-3.5 w-3.5" />
                        ) : (
                          <Activity className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <strong className="text-sm">{eventLabel(event.type)}</strong>
                        <span className="flex shrink-0 items-center text-xs text-neutral-400">
                          <Clock className="mr-1 h-3 w-3" />
                          {new Date(event.occurredAt).toLocaleString([], {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </span>
                      </div>
                      {event.note && (
                        <p className="border-t border-[var(--border)] pt-2 text-xs text-neutral-600 dark:text-neutral-300">
                          {event.note}
                        </p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
