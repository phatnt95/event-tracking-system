'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Baby,
  ChevronRight,
  Clock,
  Droplets,
  Moon,
  Pill,
  Plus,
  Syringe,
  TrendingUp,
  Weight,
} from 'lucide-react';
import {
  BabyResponse,
  DashboardResponse,
  EventTimelineResponse,
  EventType,
  Gender,
  TimelineEventResponse,
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

function humanize(value: string): string {
  return value
    .split('_')
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

function getLocalDate(): string {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${today.getFullYear()}-${month}-${day}`;
}

function formatTime(occurredAt: string): string {
  return new Date(occurredAt).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function getEventIcon(type: EventType) {
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
  }
}

function getEventBadgeColor(type: EventType): string {
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
  }
}

export default function Home() {
  const [babies, setBabies] = useState<BabyResponse[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string | null>(null);
  const [events, setEvents] = useState<TimelineEventResponse[]>([]);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [isLoadingBabies, setIsLoadingBabies] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

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

  const loadDashboard = useCallback(async (babyId: string) => {
    setIsLoadingDashboard(true);
    setDashboardError(null);
    try {
      const params = new URLSearchParams({
        babyId,
        date: getLocalDate(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      const result = await apiFetch<DashboardResponse>(`/dashboard?${params.toString()}`);
      setDashboard(result);
    } catch (error: unknown) {
      setDashboard(null);
      setDashboardError(getErrorMessage(error, "Failed to load today's dashboard."));
    } finally {
      setIsLoadingDashboard(false);
    }
  }, []);

  useEffect(() => {
    void loadBabies();
  }, [loadBabies]);

  useEffect(() => {
    if (selectedBabyId) {
      void loadEvents(selectedBabyId);
      void loadDashboard(selectedBabyId);
    } else {
      setEvents([]);
      setDashboard(null);
    }
  }, [loadDashboard, loadEvents, selectedBabyId]);

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
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                    Today&apos;s summary
                  </h2>
                  <p className="mt-1 text-xs text-neutral-500">
                    {selectedBaby
                      ? `${selectedBaby.name}'s activity for today`
                      : 'Select a baby to view activity'}
                  </p>
                </div>
                <span className="text-xs text-neutral-400">{getLocalDate()}</span>
              </div>

              {isLoadingDashboard ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  {[0, 1, 2, 3, 4, 5].map((index) => (
                    <div
                      key={index}
                      className="h-28 animate-pulse rounded-2xl bg-neutral-100 dark:bg-neutral-900"
                    />
                  ))}
                </div>
              ) : dashboardError ? (
                <p className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-600">
                  {dashboardError}
                </p>
              ) : !selectedBabyId ? (
                <p className="text-sm text-neutral-500">
                  Add or select a baby to see today&apos;s summary.
                </p>
              ) : dashboard ? (
                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <DashboardCard
                    label="Today's feeds"
                    value={`${dashboard.feedCount}`}
                    detail="records"
                  />
                  <DashboardCard
                    label="Milk intake"
                    value={`${dashboard.milkIntakeMl} ml`}
                    detail="bottle feeds"
                  />
                  <DashboardCard label="Pee" value={`${dashboard.peeCount}`} detail="times" />
                  <DashboardCard label="Poop" value={`${dashboard.poopCount}`} detail="times" />
                  <DashboardCard
                    label="Last feeding"
                    value={
                      dashboard.lastFeeding ? formatTime(dashboard.lastFeeding.occurredAt) : '—'
                    }
                    detail={
                      dashboard.lastFeeding
                        ? humanize(dashboard.lastFeeding.feedType)
                        : 'No feed today'
                    }
                  />
                  <DashboardCard
                    label="Last diaper"
                    value={dashboard.lastDiaper ? formatTime(dashboard.lastDiaper.occurredAt) : '—'}
                    detail={
                      dashboard.lastDiaper
                        ? humanize(dashboard.lastDiaper.status)
                        : 'No diaper today'
                    }
                  />
                </div>
              ) : (
                <p className="text-sm text-neutral-500">No dashboard data is available yet.</p>
              )}
            </section>

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
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-500">
                  Recent timeline
                </h2>
                {selectedBabyId && (
                  <Link
                    href={`/babies/${selectedBabyId}/events`}
                    className="text-xs font-semibold text-[var(--primary)] hover:text-[var(--primary-hover)]"
                  >
                    View all
                  </Link>
                )}
              </div>
              {isLoadingEvents ? (
                <p className="text-sm text-neutral-500">Loading events…</p>
              ) : events.length === 0 ? (
                <p className="text-sm text-neutral-500">No events recorded yet.</p>
              ) : (
                <div className="relative ml-3 space-y-6 border-l border-[var(--border)] pl-6">
                  {events.map((event, index) => {
                    const previous = events[index - 1];
                    const isNewDate =
                      !previous ||
                      new Date(previous.occurredAt).toDateString() !==
                        new Date(event.occurredAt).toDateString();

                    return (
                      <article key={event.id} className="relative">
                        {isNewDate && (
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                            {new Date(event.occurredAt).toLocaleDateString([], {
                              weekday: 'long',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        )}
                        <span className="absolute -left-[33px] top-1 rounded-full border border-[var(--background)] bg-[var(--card-bg)] p-1.5 shadow-sm">
                          {getEventIcon(event.type)}
                        </span>
                        <div className="rounded-2xl border border-[var(--border)] bg-neutral-50/50 p-4 transition hover:border-[var(--primary)]/40 dark:bg-neutral-900/20">
                          <div className="flex items-start justify-between gap-3">
                            <span
                              className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getEventBadgeColor(event.type)}`}
                            >
                              {event.type}
                            </span>
                            <span className="flex shrink-0 items-center text-xs text-neutral-400">
                              <Clock className="mr-1 h-3.5 w-3.5" />
                              {new Date(event.occurredAt).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>

                          {event.feed && (
                            <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 border-t border-[var(--border)] pt-2 text-xs text-neutral-600 dark:text-neutral-300 sm:grid-cols-2">
                              <div>
                                <dt className="inline text-neutral-400">Feed category: </dt>
                                <dd className="inline font-medium">
                                  {humanize(event.feed.feedType)}
                                </dd>
                              </div>
                              {event.feed.consumedVolume !== null && (
                                <div>
                                  <dt className="inline text-neutral-400">Consumed: </dt>
                                  <dd className="inline font-medium">
                                    {event.feed.consumedVolume} ml
                                  </dd>
                                </div>
                              )}
                            </dl>
                          )}

                          {event.diaper && (
                            <dl className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 border-t border-[var(--border)] pt-2 text-xs text-neutral-600 dark:text-neutral-300 sm:grid-cols-2">
                              <div>
                                <dt className="inline text-neutral-400">Diaper status: </dt>
                                <dd className="inline font-medium">
                                  {humanize(event.diaper.status)}
                                </dd>
                              </div>
                              {event.diaper.poopColor && (
                                <div>
                                  <dt className="inline text-neutral-400">Poop color: </dt>
                                  <dd className="inline font-medium">
                                    {humanize(event.diaper.poopColor)}
                                  </dd>
                                </div>
                              )}
                            </dl>
                          )}

                          {event.note && (
                            <p className="mt-2.5 border-t border-[var(--border)] pt-2 text-xs text-neutral-700 dark:text-neutral-300">
                              {event.note}
                            </p>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="rounded-2xl border border-[var(--border)] bg-neutral-50/60 p-4 dark:bg-neutral-900/30">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className="mt-2 text-xl font-bold tracking-tight text-neutral-800 dark:text-white">
        {value}
      </p>
      <p className="mt-1 text-xs text-neutral-400">{detail}</p>
    </article>
  );
}
