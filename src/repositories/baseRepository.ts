// ─── BASE REPOSITORY ────────────────────────────────────────────────────────
// Firestore has been removed. All data now comes from our Node.js backend.
// This base client wraps the REST API using fetch with Bearer token auth.

const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
const API_BASE_URL = metaEnv?.VITE_API_URL || 'http://localhost:5001/api/v1';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const apiFetch = async <T>(
  path: string,
  options: RequestInit = {},
  isRetry: boolean = false,
): Promise<T> => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
      ...(options.headers ?? {}),
    },
  });

  const json = (await res.json()) as { success: boolean; message?: string; data?: T };

  if (!res.ok) {
    // If token expired (401) and we haven't retried yet, attempt automatic token refresh
    if (res.status === 401 && !isRetry && !path.includes('/auth/login') && !path.includes('/auth/refresh')) {
      console.warn('⚠️ Token expired in apiFetch. Attempting automatic token refresh...');
      try {
        const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        const refreshJson = await refreshRes.json();
        if (refreshRes.ok && refreshJson?.data?.accessToken) {
          const newAccessToken = refreshJson.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
          console.log('✅ Access Token refreshed in baseRepository. Retrying request...');
          return apiFetch<T>(path, options, true);
        }
      } catch (err) {
        console.error('❌ Automatic token refresh failed in baseRepository:', err);
      }
      // If refresh failed, clear local session
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }

    throw new Error(json.message || `API Error: ${res.status}`);
  }

  return json.data as T;
};

// ─── Generic CRUD helpers (used by specific repositories) ───────────────────

export const apiGet = <T>(path: string): Promise<T> =>
  apiFetch<T>(path, { method: 'GET' });

export const apiPost = <T>(path: string, body: unknown): Promise<T> =>
  apiFetch<T>(path, {
    method: 'POST',
    body: JSON.stringify(body),
  });

export const apiPatch = <T>(path: string, body: unknown): Promise<T> =>
  apiFetch<T>(path, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });

export const apiDelete = <T>(path: string): Promise<T> =>
  apiFetch<T>(path, { method: 'DELETE' });

// ─── Legacy Firestore types kept for migration compat ───────────────────────
// TODO: Remove once all repositories have been updated to use RTK Query endpoints.

export type FirestoreFilter = {
  field: string;
  op: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'array-contains';
  value: unknown;
};

export type FirestoreQueryOptions = {
  filters?: FirestoreFilter[];
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  limitCount?: number;
  startAfterDocId?: string;
};

export type FirestoreQueryResult<T> = {
  items: T[];
  lastDocId?: string;
  hasMore: boolean;
};

// Stubs for backward compat — throw informative errors if called
export const getCollectionRef = (_name: string): never => {
  throw new Error('[DEPRECATED] Firestore has been removed. Use RTK Query or apiGet() instead.');
};

export const getDocumentRef = (_collectionName: string, _id: string): never => {
  throw new Error('[DEPRECATED] Firestore has been removed. Use RTK Query or apiGet() instead.');
};

export const queryDocuments = <T = unknown>(_collectionName: string, _options?: FirestoreQueryOptions): Promise<FirestoreQueryResult<T>> => {
  throw new Error('[DEPRECATED] Firestore has been removed. Use RTK Query endpoints instead.');
};

export const getDocument = <T = unknown>(_collectionName: string, _id: string): Promise<(T & { id: string }) | null> => {
  throw new Error('[DEPRECATED] Firestore has been removed. Use RTK Query endpoints instead.');
};

export const createDocument = <T = unknown>(_collectionName: string, _data: Partial<T>): Promise<T & { id: string }> => {
  throw new Error('[DEPRECATED] Firestore has been removed. Use RTK Query endpoints instead.');
};

export const setDocument = <T = unknown>(_collectionName: string, _id: string, _data: Partial<T>): Promise<T & { id: string }> => {
  throw new Error('[DEPRECATED] Firestore has been removed. Use RTK Query endpoints instead.');
};

export const updateDocument = <T = unknown>(_collectionName: string, _id: string, _data: Partial<T>): Promise<T & { id: string }> => {
  throw new Error('[DEPRECATED] Firestore has been removed. Use RTK Query endpoints instead.');
};

export const deleteDocument = (_collectionName: string, _id: string): Promise<{ success: boolean }> => {
  throw new Error('[DEPRECATED] Firestore has been removed. Use RTK Query endpoints instead.');
};
