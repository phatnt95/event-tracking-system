/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import { apiFetch } from '../../../lib/api';
import Header from '../../../components/Header';
import { Baby, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Gender } from '@baby-tracker/shared-types';

export default function CreateBabyPage() {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [birthday, setBirthday] = useState('');
  const [birthWeight, setBirthWeight] = useState('');
  const [birthHeight, setBirthHeight] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!name.trim()) {
      setError('Baby name is required');
      setLoading(false);
      return;
    }
    if (!birthday) {
      setError('Birthday is required');
      setLoading(false);
      return;
    }

    try {
      const payload: any = {
        name,
        gender,
        birthday: new Date(birthday).toISOString(),
      };
      if (nickname.trim()) payload.nickname = nickname;
      if (birthWeight) payload.birthWeight = parseFloat(birthWeight);
      if (birthHeight) payload.birthHeight = parseFloat(birthHeight);
      if (note.trim()) payload.note = note;

      await apiFetch('/babies', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      window.location.href = '/babies';
    } catch (err: any) {
      setError(err.message || 'Failed to register baby profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
      <Header />

      <main className="max-w-xl mx-auto px-4 py-10">
        <Link
          href="/babies"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Babies List</span>
        </Link>

        <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-orange-50 dark:bg-orange-950/20 text-[var(--primary)] p-3 rounded-2xl">
              <Baby className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-white">
                New Baby Profile
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Register a new baby to track their growth logs.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Baby Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liam, Sophia"
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Nickname
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Lily, Sophy"
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[Gender.MALE, Gender.FEMALE, Gender.OTHER].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-4 rounded-xl border text-sm font-medium transition-all ${
                      gender === g
                        ? 'border-[var(--primary)] bg-orange-50 text-[var(--primary)] dark:bg-orange-950/20'
                        : 'border-[var(--border)] hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                    }`}
                  >
                    {g.charAt(0) + g.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Birthday <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-1">
                <input
                  type="date"
                  required
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="block w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Birth Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={birthWeight}
                  onChange={(e) => setBirthWeight(e.target.value)}
                  placeholder="e.g. 3.45"
                  className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Birth Height (cm)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={birthHeight}
                  onChange={(e) => setBirthHeight(e.target.value)}
                  placeholder="e.g. 50.5"
                  className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Notes
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Describe birth details, pediatrician remarks, or allergies..."
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Register Baby Profile'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
