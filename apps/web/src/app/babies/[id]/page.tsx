/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import Header from '../../../components/Header';
import { Baby, ArrowLeft, Loader2, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Gender, BabyResponse } from '@baby-tracker/shared-types';

export default function EditBabyPage() {
  const params = useParams();
  const id = params?.id as string;

  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender>(Gender.MALE);
  const [birthday, setBirthday] = useState('');
  const [birthWeight, setBirthWeight] = useState('');
  const [birthHeight, setBirthHeight] = useState('');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchBaby = async () => {
      try {
        const baby = await apiFetch<BabyResponse>(`/babies/${id}`);
        setName(baby.name);
        setNickname(baby.nickname || '');
        setGender(baby.gender);
        // Format birthday date value for input date
        if (baby.birthday) {
          const date = new Date(baby.birthday);
          const yyyy = date.getFullYear();
          const mm = String(date.getMonth() + 1).padStart(2, '0');
          const dd = String(date.getDate()).padStart(2, '0');
          setBirthday(`${yyyy}-${mm}-${dd}`);
        }
        setBirthWeight(baby.birthWeight ? String(baby.birthWeight) : '');
        setBirthHeight(baby.birthHeight ? String(baby.birthHeight) : '');
        setNote(baby.note || '');
      } catch (err: any) {
        setError(err.message || 'Failed to load baby profile');
      } finally {
        setLoading(false);
      }
    };
    fetchBaby();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    if (!name.trim()) {
      setError('Baby name is required');
      setSaving(false);
      return;
    }
    if (!birthday) {
      setError('Birthday is required');
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        name,
        gender,
        birthday: new Date(birthday).toISOString(),
        nickname: nickname.trim() ? nickname : null,
        birthWeight: birthWeight ? parseFloat(birthWeight) : null,
        birthHeight: birthHeight ? parseFloat(birthHeight) : null,
        note: note.trim() ? note : null,
      };

      await apiFetch(`/babies/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      setSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setError(err.message || 'Failed to update baby profile');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async () => {
    if (
      !confirm(
        'Are you sure you want to archive this baby profile? This will hide it from active dashboards.',
      )
    )
      return;
    setError('');
    setArchiving(true);
    try {
      await apiFetch(`/babies/${id}/archive`, { method: 'POST' });
      window.location.href = '/babies';
    } catch (err: any) {
      setError(err.message || 'Failed to archive baby profile');
      setArchiving(false);
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

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-[var(--primary)]" />
            <p className="text-xs text-neutral-500 mt-2">Loading baby profile details...</p>
          </div>
        ) : (
          <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-orange-50 dark:bg-orange-950/20 text-[var(--primary)] p-3 rounded-2xl">
                  <Baby className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-white">
                    {name}
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Edit or manage this baby profile.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleArchive}
                disabled={archiving}
                className="inline-flex items-center space-x-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 rounded-xl text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                {archiving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>Archive</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-sm font-medium">
                  Profile updated successfully!
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
                <input
                  type="date"
                  required
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
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
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 border border-[var(--border)] rounded-xl bg-transparent text-neutral-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full flex justify-center items-center space-x-2 py-2.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5" />
                  )}
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
