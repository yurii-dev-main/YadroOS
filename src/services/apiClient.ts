import axios from 'axios';

import { useAuthStore } from '../store/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
export const IS_DEMO_MODE = import.meta.env.VITE_IS_DEMO_MODE === 'true';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

// Shared in-flight refresh — prevents concurrent refresh storms
let pendingRefresh: Promise<void> | null = null;

// These endpoints must never trigger an auto-refresh retry
const AUTH_SKIP_URLS = ['/auth/refresh', '/auth/login', '/auth/logout'];

apiClient.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().tokens?.accessToken;
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    const originalConfig = error.config;

    // Determine if this request is an auth-infrastructure call that should
    // never be retried (prevents the infinite-loop crash).
    const isAuthSkipUrl = AUTH_SKIP_URLS.some((url) =>
      originalConfig?.url?.includes(url)
    );

    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig._refreshRetried && // never retry twice
      !isAuthSkipUrl                      // never retry auth calls
    ) {
      // Mark immediately so any parallel requests that also see 401
      // won't queue another retry loop.
      originalConfig._refreshRetried = true;

      try {
        // Deduplicate: if refresh is already in-flight, piggyback on it.
        if (!pendingRefresh) {
          pendingRefresh = useAuthStore
            .getState()
            .refreshTokens()
            .finally(() => {
              pendingRefresh = null;
            });
        }

        await pendingRefresh;

        // Retry the original request with the fresh access token.
        return apiClient.request(originalConfig);
      } catch {
        // Refresh failed — log out cleanly and reject without another retry.
        await useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  }
);
