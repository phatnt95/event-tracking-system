/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Header from '../../components/Header';
import VaccinationFormModal from '../../components/VaccinationFormModal';
import {
  BabyResponse,
  BabyVaccinationsResponse,
  VaccinationRecordResponse,
  VaccinationStatus,
} from '@baby-tracker/shared-types';
import { apiFetch, getErrorMessage } from '../../lib/api';
import {
  Syringe,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ChevronDown,
  Calendar,
  Building2,
  UserCheck,
  FileText,
} from 'lucide-react';

function getStatusBadge(status: VaccinationStatus, overdueDays?: number, remainingDays?: number) {
  switch (status) {
    case VaccinationStatus.COMPLETED:
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Completed</span>
        </span>
      );
    case VaccinationStatus.OVERDUE:
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800/50">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>{overdueDays ? `${overdueDays} days overdue` : 'Overdue'}</span>
        </span>
      );
    case VaccinationStatus.UPCOMING:
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/50">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {remainingDays === 0
              ? 'Due Today'
              : remainingDays !== undefined
                ? `Due in ${remainingDays} days`
                : 'Upcoming'}
          </span>
        </span>
      );
    case VaccinationStatus.OPTIONAL:
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800/50">
          <span>Optional</span>
        </span>
      );
    case VaccinationStatus.SKIPPED:
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
          <span>Skipped</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400">
          <span>Pending</span>
        </span>
      );
  }
}

export default function VaccinationsPage() {
  const [babies, setBabies] = useState<BabyResponse[]>([]);
  const [selectedBabyId, setSelectedBabyId] = useState<string>('');
  const [data, setData] = useState<BabyVaccinationsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');

  // Modal state
  const [selectedVaccination, setSelectedVaccination] = useState<VaccinationRecordResponse | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load Babies list
  useEffect(() => {
    const fetchBabies = async () => {
      try {
        const babyList = await apiFetch<BabyResponse[]>('/babies');
        setBabies(babyList);
        if (babyList.length > 0) {
          setSelectedBabyId(babyList[0].id);
        }
      } catch (err: any) {
        setError(getErrorMessage(err, 'Failed to load babies list'));
      }
    };
    fetchBabies();
  }, []);

  // Load Vaccinations for selected baby
  const fetchVaccinations = async (babyId: string) => {
    if (!babyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<BabyVaccinationsResponse>(`/babies/${babyId}/vaccinations`);
      setData(res);
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to load vaccination schedule'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBabyId) {
      fetchVaccinations(selectedBabyId);
    }
  }, [selectedBabyId]);

  const currentBaby = useMemo(() => {
    return babies.find((b) => b.id === selectedBabyId);
  }, [babies, selectedBabyId]);

  const filteredTimeline = useMemo(() => {
    if (!data) return [];
    if (filter === 'OVERDUE') return data.overdue;
    if (filter === 'UPCOMING') return data.upcoming;
    if (filter === 'COMPLETED') return data.completed;
    if (filter === 'OPTIONAL') return data.timeline.filter((r) => r.isOptional);
    return data.timeline;
  }, [data, filter]);

  const completionPercentage = useMemo(() => {
    if (!data || data.timeline.length === 0) return 0;
    const required = data.timeline.filter((r) => !r.isOptional);
    if (required.length === 0) return 0;
    const completedRequired = required.filter((r) => r.status === VaccinationStatus.COMPLETED);
    return Math.round((completedRequired.length / required.length) * 100);
  }, [data]);

  const handleOpenRecordModal = (item: VaccinationRecordResponse) => {
    setSelectedVaccination(item);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-neutral-800 dark:text-neutral-100 flex flex-col font-sans pb-16">
      <Header />

      <main className="max-w-5xl mx-auto w-full px-4 md:px-8 pt-6 space-y-6 flex-1">
        {/* Top Header & Baby Selector */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-pink-500 text-white rounded-2xl shadow-lg shadow-pink-500/20">
              <Syringe className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-white">
                Vaccination Tracker
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Recommended immunization timeline & history
              </p>
            </div>
          </div>

          {babies.length > 0 && (
            <div className="relative">
              <select
                value={selectedBabyId}
                onChange={(e) => setSelectedBabyId(e.target.value)}
                className="appearance-none bg-[var(--card)] border border-[var(--border)] rounded-2xl px-4 py-2.5 pr-10 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 text-neutral-800 dark:text-white cursor-pointer"
              >
                {babies.map((b) => (
                  <option key={b.id} value={b.id}>
                    👶 {b.name} ({new Date(b.birthday).toLocaleDateString()})
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
            </div>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs font-semibold text-red-600 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-pink-500 border-t-transparent" />
            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              Loading vaccination schedule...
            </p>
          </div>
        ) : data ? (
          <>
            {/* Dashboard Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Overdue */}
              <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/10 border border-red-200/80 dark:border-red-900/40 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                    Overdue Vaccines
                  </p>
                  <h3 className="text-3xl font-extrabold text-red-700 dark:text-red-300 mt-1">
                    {data.overdue.length}
                  </h3>
                  <p className="text-[11px] text-red-500 dark:text-red-400 mt-0.5">
                    {data.overdue.length > 0
                      ? 'Requires immediate attention'
                      : 'All scheduled vaccines up to date'}
                  </p>
                </div>
                <div className="p-3 bg-red-500/10 text-red-600 rounded-2xl">
                  <AlertTriangle className="h-7 w-7" />
                </div>
              </div>

              {/* Upcoming */}
              <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/10 border border-amber-200/80 dark:border-amber-900/40 rounded-3xl p-5 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    Upcoming (30 Days)
                  </p>
                  <h3 className="text-3xl font-extrabold text-amber-700 dark:text-amber-300 mt-1">
                    {data.upcoming.length}
                  </h3>
                  <p className="text-[11px] text-amber-500 dark:text-amber-400 mt-0.5">
                    {data.upcoming.length > 0
                      ? 'Next vaccination due soon'
                      : 'No vaccines due in 30 days'}
                  </p>
                </div>
                <div className="p-3 bg-amber-500/10 text-amber-600 rounded-2xl">
                  <Clock className="h-7 w-7" />
                </div>
              </div>

              {/* Progress */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200/80 dark:border-emerald-900/40 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      Schedule Completion
                    </p>
                    <h3 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                      {completionPercentage}%
                    </h3>
                  </div>
                  <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-2xl">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                </div>
                <div className="w-full bg-emerald-200/50 dark:bg-emerald-950/50 h-2 rounded-full overflow-hidden mt-3">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Filter Navigation */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
              <div className="flex items-center space-x-1 bg-[var(--card)] border border-[var(--border)] p-1 rounded-2xl shadow-sm overflow-x-auto">
                {[
                  { id: 'ALL', label: `All (${data.timeline.length})` },
                  { id: 'OVERDUE', label: `Overdue (${data.overdue.length})` },
                  { id: 'UPCOMING', label: `Upcoming (${data.upcoming.length})` },
                  { id: 'COMPLETED', label: `Completed (${data.completed.length})` },
                  {
                    id: 'OPTIONAL',
                    label: `Optional (${data.timeline.filter((r) => r.isOptional).length})`,
                  },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setFilter(item.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      filter === item.id
                        ? 'bg-pink-500 text-white shadow-md shadow-pink-500/20'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline List */}
            <div className="space-y-4">
              {filteredTimeline.length === 0 ? (
                <div className="py-12 text-center bg-[var(--card)] border border-[var(--border)] rounded-3xl p-8">
                  <Syringe className="h-10 w-10 text-neutral-400 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">
                    No vaccination records found for this view.
                  </p>
                </div>
              ) : (
                filteredTimeline.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left: Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-neutral-800 dark:text-white">
                          {item.vaccineName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-[var(--border)]">
                          {item.dose}
                        </span>
                        {getStatusBadge(item.status, item.overdueDays, item.remainingDays)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3.5 w-3.5 text-pink-500" />
                          <span>
                            Recommended:{' '}
                            {new Date(item.recommendedDate).toLocaleDateString(undefined, {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            ({item.recommendedAgeMonths} mo)
                          </span>
                        </div>

                        {item.actualVaccinationDate && (
                          <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>
                              Given:{' '}
                              {new Date(item.actualVaccinationDate).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Clinic / Doctor / Notes details if present */}
                      {(item.hospitalClinic || item.doctor || item.notes) && (
                        <div className="pt-2 border-t border-[var(--border)] flex flex-wrap gap-x-4 gap-y-1 text-xs text-neutral-600 dark:text-neutral-300">
                          {item.hospitalClinic && (
                            <div className="flex items-center space-x-1">
                              <Building2 className="h-3.5 w-3.5 text-neutral-400" />
                              <span>{item.hospitalClinic}</span>
                            </div>
                          )}
                          {item.doctor && (
                            <div className="flex items-center space-x-1">
                              <UserCheck className="h-3.5 w-3.5 text-neutral-400" />
                              <span>{item.doctor}</span>
                            </div>
                          )}
                          {item.notes && (
                            <div className="flex items-center space-x-1 text-neutral-500 italic">
                              <FileText className="h-3.5 w-3.5 text-neutral-400" />
                              <span>"{item.notes}"</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center space-x-2 shrink-0 self-start md:self-center">
                      <button
                        onClick={() => handleOpenRecordModal(item)}
                        className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all shadow-sm ${
                          item.status === VaccinationStatus.COMPLETED
                            ? 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-200'
                            : 'bg-pink-500 hover:bg-pink-600 text-white shadow-pink-500/20'
                        }`}
                      >
                        {item.status === VaccinationStatus.COMPLETED
                          ? 'Edit Record'
                          : 'Record Vaccination'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        ) : null}
      </main>

      {/* Record Vaccination Modal */}
      <VaccinationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        vaccination={selectedVaccination}
        babyBirthday={currentBaby?.birthday}
        onSuccess={() => {
          if (selectedBabyId) fetchVaccinations(selectedBabyId);
        }}
      />
    </div>
  );
}
