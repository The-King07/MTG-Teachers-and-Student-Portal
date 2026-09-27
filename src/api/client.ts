export const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('make_the_grade_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('make_the_grade_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('make_the_grade_token');
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || 'An unexpected error occurred.';
    throw new Error(errorMsg);
  }

  return data as T;
}
