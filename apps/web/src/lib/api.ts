/* eslint-disable @typescript-eslint/no-explicit-any */
import { TokenResponse } from '@baby-tracker/shared-types';

const API_BASE_URL = 'http://localhost:3000/api';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
  ) {
    super(message);
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers = new Headers(options.headers);
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      throw new ApiError(response.status, 'Unknown error occurred');
    }

    // Check if token is unauthorized and attempt RTR refresh
    if (response.status === 401 && typeof window !== 'undefined') {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && endpoint !== '/auth/refresh') {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json();
            const newTokens: TokenResponse = refreshData.data;
            localStorage.setItem('accessToken', newTokens.accessToken);
            localStorage.setItem('refreshToken', newTokens.refreshToken);

            // Retry the original request
            headers.set('Authorization', `Bearer ${newTokens.accessToken}`);
            const retryRes = await fetch(url, { ...options, headers });
            if (retryRes.ok) {
              const retryData = await retryRes.json();
              return retryData.data;
            }
          }
        } catch (e) {
          console.error('Auto-refresh token failed', e);
        }
      }

      // Clear and redirect if unauthorized
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }

    const err = errorData?.error || {};
    throw new ApiError(
      err.statusCode || response.status,
      err.message || 'An error occurred',
      err.code,
    );
  }

  const resJson = await response.json();
  return resJson.data;
}
