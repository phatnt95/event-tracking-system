/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import { Baby, LogOut, User, LayoutDashboard, Home as HomeIcon, Plus, Syringe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { apiFetch } from '../lib/api';

export default function Header() {
  const pathname = usePathname();
  const [profile, setProfile] = useState<{ displayName: string; email: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await apiFetch<any>('/auth/me');
        setProfile(user);
      } catch (err) {
        console.error('Failed to load profile', err);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken }),
        });
      }
    } catch (e) {
      console.error('Error logging out', e);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
  };

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-10 backdrop-blur-md bg-[var(--background)]/80 border-b border-[var(--border)] px-4 py-4 md:px-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <div className="bg-[var(--primary)] text-white p-2 rounded-2xl shadow-md shadow-orange-500/20">
            <Baby className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-800 dark:text-white">
              Baby Tracker
            </h1>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">Interactive Dashboard</p>
          </div>
        </Link>

        <div className="flex items-center space-x-2 md:space-x-4">
          <Link
            href="/"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              isActive('/')
                ? 'bg-orange-50 text-[var(--primary)] dark:bg-orange-950/20 font-semibold'
                : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800'
            }`}
          >
            <HomeIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          <Link
            href="/babies"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              isActive('/babies')
                ? 'bg-orange-50 text-[var(--primary)] dark:bg-orange-950/20 font-semibold'
                : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Babies</span>
          </Link>

          <Link
            href="/vaccinations"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${
              isActive('/vaccinations')
                ? 'bg-pink-50 text-pink-600 dark:bg-pink-950/20 font-semibold'
                : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:text-white dark:hover:bg-neutral-800'
            }`}
          >
            <Syringe className="h-4 w-4 text-pink-500" />
            <span>Vaccinations</span>
          </Link>

          <Link
            href="/babies/new"
            className="hidden sm:flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Baby</span>
          </Link>

          {profile ? (
            <div className="flex items-center space-x-3 pl-3 border-l border-[var(--border)]">
              <div className="hidden md:block text-right">
                <p className="text-xs font-semibold text-neutral-800 dark:text-white">
                  {profile.displayName}
                </p>
                <p className="text-[10px] text-neutral-500 dark:text-neutral-400">
                  {profile.email}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-neutral-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
                title="Log Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-sm font-medium bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Log In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
