'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '../components/Header';
import { Baby, Clock, Droplets, Activity, ChevronRight, Weight, Moon, Plus } from 'lucide-react';
import { EventType, DiaperStatus, FeedType, Gender } from '@baby-tracker/shared-types';

export default function Home() {
  const [selectedBaby, setSelectedBaby] = useState('1');

  // Mock data utilizing the exported shared-types schemas
  const babies = [
    {
      id: '1',
      name: 'Liam',
      nickname: 'Lily',
      gender: Gender.MALE,
      age: '3 months',
      weight: '6.2 kg',
      height: '61 cm',
    },
    {
      id: '2',
      name: 'Sophia',
      nickname: 'Sophy',
      gender: Gender.FEMALE,
      age: '1 month',
      weight: '4.5 kg',
      height: '54 cm',
    },
  ];

  const events = [
    {
      id: 'e1',
      type: EventType.FEED,
      eventTime: '08:30 AM',
      notes: 'Consumed formula well, a bit burpy.',
      details: {
        feedType: FeedType.FORMULA,
        preparedVolume: 120,
        consumedVolume: 100,
        brand: 'Similac',
      },
    },
    {
      id: 'e2',
      type: EventType.DIAPER,
      eventTime: '07:45 AM',
      notes: 'No blood, regular stool consistency.',
      details: {
        diaperType: DiaperStatus.BOTH,
        stoolColor: 'Yellow',
        stoolConsistency: 'Soft',
        stoolAmount: 'Medium',
      },
    },
    {
      id: 'e3',
      type: EventType.FEED,
      eventTime: '05:15 AM',
      notes: 'Nursed actively on both sides.',
      details: {
        feedType: FeedType.BREASTFEEDING,
        leftDuration: 12,
        rightDuration: 10,
      },
    },
  ];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] pb-12 transition-colors duration-200 font-sans">
      <Header />


      <main className="max-w-5xl mx-auto px-4 pt-8 md:px-8">
        {/* Core Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Baby Profile Summary & App State */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                  Babies
                </h3>
                <Link
                  href="/babies/new"
                  className="text-[var(--primary)] hover:text-[var(--primary-hover)] p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
                  title="Add new baby profile"
                >
                  <Plus className="h-5 w-5" />
                </Link>
              </div>

              {/* Baby Selectors */}
              <div className="space-y-3">
                {babies.map((baby) => (
                  <div
                    key={baby.id}
                    onClick={() => setSelectedBaby(baby.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition border ${
                      selectedBaby === baby.id
                        ? 'border-[var(--primary)] bg-[var(--primary)]/5 dark:bg-[var(--primary)]/10'
                        : 'border-[var(--border)] hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-xl ${
                          baby.gender === Gender.MALE
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'bg-pink-100 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
                        }`}
                      >
                        <Baby className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{baby.name}</h4>
                        <p className="text-xs text-neutral-500">{baby.age}</p>
                      </div>
                    </div>
                    {selectedBaby === baby.id && (
                      <ChevronRight className="h-4 w-4 text-[var(--primary)]" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Baby Health Statistics Card */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">
                Stats
              </h3>
              {babies
                .filter((b) => b.id === selectedBaby)
                .map((baby) => (
                  <div key={baby.id} className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl flex flex-col justify-center">
                      <div className="flex items-center text-neutral-500 text-xs mb-1">
                        <Weight className="h-3.5 w-3.5 mr-1" />
                        Weight
                      </div>
                      <span className="font-bold text-lg">{baby.weight}</span>
                    </div>
                    <div className="p-3 bg-neutral-50 dark:bg-neutral-900/40 rounded-2xl flex flex-col justify-center">
                      <div className="flex items-center text-neutral-500 text-xs mb-1">
                        <Activity className="h-3.5 w-3.5 mr-1" />
                        Height
                      </div>
                      <span className="font-bold text-lg">{baby.height}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Right Column: Timeline and Activity Logging (Interactive Simulator) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Logging Buttons (Mock UI with Micro-Animations) */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
                Log Activity
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <Link
                  href={`/babies/${selectedBaby}/events?type=${EventType.FEED}`}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:hover:bg-orange-900/20 transition group border border-transparent hover:border-orange-200"
                >
                  <Droplets className="h-6 w-6 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">
                    Feeding
                  </span>
                </Link>
                <Link
                  href={`/babies/${selectedBaby}/events?type=${EventType.DIAPER}`}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:hover:bg-emerald-900/20 transition group border border-transparent hover:border-emerald-200"
                >
                  <Activity className="h-6 w-6 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    Diaper
                  </span>
                </Link>
                <Link
                  href={`/babies/${selectedBaby}/events?type=${EventType.SLEEP}`}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/20 transition group border border-transparent hover:border-indigo-200"
                >
                  <Moon className="h-6 w-6 text-indigo-500 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                    Sleep
                  </span>
                </Link>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-6">
                Today's Timeline
              </h3>

              <div className="relative border-l border-[var(--border)] ml-3 pl-6 space-y-8">
                {events.map((event) => (
                  <div key={event.id} className="relative">
                    {/* Circle timeline dot */}
                    <div
                      className={`absolute -left-[31px] top-0 p-1.5 rounded-full border border-[var(--background)] ${
                        event.type === EventType.FEED
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
                          : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400'
                      }`}
                    >
                      {event.type === EventType.FEED ? (
                        <Droplets className="h-3.5 w-3.5" />
                      ) : (
                        <Activity className="h-3.5 w-3.5" />
                      )}
                    </div>

                    {/* Timeline card content */}
                    <div className="bg-neutral-50/50 dark:bg-neutral-900/20 border border-[var(--border)] rounded-2xl p-4 transition hover:border-[var(--primary)]/40">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm">
                            {event.type === EventType.FEED
                              ? `Feeding (${event.details.feedType === FeedType.FORMULA ? 'Formula' : 'Breastfeeding'})`
                              : 'Diaper Change'}
                          </span>
                        </div>
                        <div className="flex items-center text-xs text-neutral-400">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.eventTime}
                        </div>
                      </div>

                      {/* Detail attributes */}
                      <div className="text-xs text-neutral-600 dark:text-neutral-300 space-y-1 mb-2">
                        {event.type === EventType.FEED ? (
                          event.details.feedType === FeedType.FORMULA ? (
                            <>
                              <div>
                                Formula Brand: <strong>{event.details.brand}</strong>
                              </div>
                              <div>
                                Consumed: <strong>{event.details.consumedVolume}ml</strong> /{' '}
                                {event.details.preparedVolume}ml
                              </div>
                            </>
                          ) : (
                            <div>
                              Duration: <strong>{event.details.leftDuration}m left</strong> /{' '}
                              {event.details.rightDuration}m right
                            </div>
                          )
                        ) : (
                          <>
                            <div>
                              Type: <strong>{event.details.diaperType}</strong>
                            </div>
                            <div>
                              Stool: <strong>{event.details.stoolColor}</strong> color,{' '}
                              <strong>{event.details.stoolConsistency}</strong> consistency
                            </div>
                          </>
                        )}
                      </div>

                      {event.notes && (
                        <p className="text-xs italic text-neutral-400 border-t border-[var(--border)] pt-2 mt-2">
                          "{event.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
