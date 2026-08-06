/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, Syringe } from 'lucide-react';
import { VaccinationRecordResponse } from '@baby-tracker/shared-types';
import { apiFetch, getErrorMessage } from '../lib/api';

interface VaccinationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaccination: VaccinationRecordResponse | null;
  babyBirthday?: string;
  onSuccess: () => void;
}

export default function VaccinationFormModal({
  isOpen,
  onClose,
  vaccination,
  babyBirthday,
  onSuccess,
}: VaccinationFormModalProps) {
  const [actualVaccinationDate, setActualVaccinationDate] = useState('');
  const [hospitalClinic, setHospitalClinic] = useState('');
  const [doctor, setDoctor] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vaccination) {
      const defaultDate = vaccination.actualVaccinationDate
        ? new Date(vaccination.actualVaccinationDate).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16);

      setActualVaccinationDate(defaultDate);
      setHospitalClinic(vaccination.hospitalClinic || '');
      setDoctor(vaccination.doctor || '');
      setManufacturer(vaccination.manufacturer || '');
      setBatchNumber(vaccination.batchNumber || '');
      setNotes(vaccination.notes || '');
      setError(null);
    }
  }, [vaccination, isOpen]);

  if (!isOpen || !vaccination) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const dateToSave = new Date(actualVaccinationDate);
    if (isNaN(dateToSave.getTime())) {
      setError('Please select a valid date and time.');
      return;
    }

    if (babyBirthday) {
      const birthDate = new Date(babyBirthday);
      if (dateToSave < birthDate) {
        setError('Vaccination date cannot be before baby birth date.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        actualVaccinationDate: dateToSave.toISOString(),
        hospitalClinic: hospitalClinic.trim() || undefined,
        doctor: doctor.trim() || undefined,
        manufacturer: manufacturer.trim() || undefined,
        batchNumber: batchNumber.trim() || undefined,
        notes: notes.trim() || undefined,
      };

      if (vaccination.status === 'COMPLETED') {
        await apiFetch(`/vaccinations/${vaccination.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch(`/vaccinations/${vaccination.id}/complete`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(getErrorMessage(err, 'Failed to save vaccination record'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)] bg-gradient-to-r from-pink-500/10 to-purple-500/10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-pink-500 text-white rounded-2xl shadow-md">
              <Syringe className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-neutral-800 dark:text-white">
                {vaccination.status === 'COMPLETED' ? 'Edit Vaccination' : 'Record Vaccination'}
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {vaccination.vaccineName} ({vaccination.dose})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-2xl text-xs font-semibold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Actual Vaccination Date & Time *
            </label>
            <input
              type="datetime-local"
              value={actualVaccinationDate}
              onChange={(e) => setActualVaccinationDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border)] bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Hospital / Clinic
              </label>
              <input
                type="text"
                placeholder="e.g. City Children Hospital"
                value={hospitalClinic}
                onChange={(e) => setHospitalClinic(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border)] bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Attending Doctor
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. John Doe"
                value={doctor}
                onChange={(e) => setDoctor(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border)] bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Manufacturer
              </label>
              <input
                type="text"
                placeholder="e.g. Sanofi Pasteur"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border)] bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Batch Number
              </label>
              <input
                type="text"
                placeholder="e.g. BATCH-2026-X9"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border)] bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Notes & Reaction
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Baby had mild fever for 1 day after vaccine..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-[var(--border)] bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl text-sm font-semibold bg-pink-500 hover:bg-pink-600 text-white shadow-md shadow-pink-500/20 transition-all disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Mark Completed'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
