/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BabyResponse } from '@baby-tracker/shared-types';
import { apiFetch } from '../../lib/api';
import Header from '../../components/Header';
import { Baby, Plus, Scale, Ruler, Calendar, ArrowRight, Trash2 } from 'lucide-react';

export default function BabiesListPage() {
  const [babies, setBabies] = useState<BabyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBabies = async () => {
    try {
      const data = await apiFetch<BabyResponse[]>('/babies');
      setBabies(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load babies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBabies();
  }, []);

  const calculateAge = (birthdayStr: string) => {
    const birthday = new Date(birthdayStr);
    const today = new Date();
    let diffMonths =
      (today.getFullYear() - birthday.getFullYear()) * 12 + today.getMonth() - birthday.getMonth();
    if (today.getDate() < birthday.getDate()) {
      diffMonths--;
    }

    if (diffMonths < 0) return 'Just born';
    if (diffMonths === 0) {
      const diffDays = Math.floor((today.getTime() - birthday.getTime()) / (1000 * 60 * 60 * 24));
      return `${diffDays} days old`;
    }
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} old`;
    }
    const years = Math.floor(diffMonths / 12);
    const months = diffMonths % 12;
    return `${years} yr${years > 1 ? 's' : ''} ${months} mo${months > 1 ? 's' : ''}`;
  };

  const handleArchive = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to archive this baby profile?')) return;
    try {
      await apiFetch(`/babies/${id}/archive`, { method: 'POST' });
      setBabies((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to archive baby');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans">
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-10 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-white">
              My Babies
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
              Select or manage your registered baby profiles.
            </p>
          </div>
          <Link
            href="/babies/new"
            className="mt-4 md:mt-0 inline-flex items-center space-x-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-4 py-2.5 rounded-2xl shadow-lg shadow-orange-500/10 font-medium transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="h-5 w-5" />
            <span>Add New Baby</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 h-52"
              />
            ))}
          </div>
        ) : babies.length === 0 ? (
          <div className="text-center py-16 bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-8 max-w-lg mx-auto">
            <div className="inline-flex bg-orange-50 dark:bg-orange-950/20 text-[var(--primary)] p-4 rounded-3xl mb-4">
              <Baby className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold text-neutral-800 dark:text-white">
              No babies registered yet
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 max-w-sm mx-auto">
              Add your baby profile to start tracking feeding times, diaper logs, and physical
              growth.
            </p>
            <Link
              href="/babies/new"
              className="mt-6 inline-flex items-center space-x-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white px-5 py-2.5 rounded-2xl font-medium transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Get Started</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {babies.map((baby) => (
              <Link
                key={baby.id}
                href={`/babies/${baby.id}`}
                className="group relative bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-6 hover:shadow-xl hover:shadow-neutral-500/5 hover:border-[var(--primary)]/30 transition-all duration-300"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="bg-orange-50 dark:bg-orange-950/20 text-[var(--primary)] p-3 rounded-2xl group-hover:scale-110 transition-transform">
                      <Baby className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-neutral-800 dark:text-white">
                        {baby.name}
                      </h4>
                      {baby.nickname && (
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          &quot;{baby.nickname}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleArchive(baby.id, e)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                    title="Archive Profile"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-6 space-y-2 border-t border-[var(--border)] pt-4">
                  <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400">
                    <Calendar className="h-4 w-4 mr-2 text-neutral-400" />
                    <span>
                      Birthday: {new Date(baby.birthday).toLocaleDateString()} (
                      {calculateAge(baby.birthday)})
                    </span>
                  </div>
                  {baby.birthWeight && (
                    <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400">
                      <Scale className="h-4 w-4 mr-2 text-neutral-400" />
                      <span>Birth Weight: {baby.birthWeight} kg</span>
                    </div>
                  )}
                  {baby.birthHeight && (
                    <div className="flex items-center text-xs text-neutral-600 dark:text-neutral-400">
                      <Ruler className="h-4 w-4 mr-2 text-neutral-400" />
                      <span>Birth Height: {baby.birthHeight} cm</span>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between text-xs font-semibold text-[var(--primary)] group-hover:translate-x-1 transition-transform">
                  <span>View &amp; Edit Profile</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
