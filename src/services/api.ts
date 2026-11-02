/**
 * PhishShield Typed API Client
 */

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('phishshield_auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}`;
    const error = new Error(errorMsg) as any;
    error.status = response.status;
    error.code = data.code;
    throw error;
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: any) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => apiRequest('/auth/me'),
  verifyEmail: () => apiRequest('/auth/verify-email', { method: 'POST' }),
  forgotPassword: (payload: { email: string }) => apiRequest('/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) }),
  resetPassword: (payload: { token: string; newPassword: string }) => apiRequest('/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Analyzers
  analyzeUrl: (payload: { url: string; saveToHistory?: boolean }) =>
    apiRequest('/analyze/url', { method: 'POST', body: JSON.stringify(payload) }),
  analyzeEmail: (payload: { subject?: string; body: string; saveToHistory?: boolean }) =>
    apiRequest('/analyze/email', { method: 'POST', body: JSON.stringify(payload) }),

  // Scans & History
  getScans: (params?: { type?: string; risk?: string; search?: string; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.risk) searchParams.set('risk', params.risk);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.offset) searchParams.set('offset', String(params.offset));
    const qs = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return apiRequest(`/scans${qs}`);
  },
  getScanById: (id: string) => apiRequest(`/scans/${id}`),
  deleteScan: (id: string) => apiRequest(`/scans/${id}`, { method: 'DELETE' }),
  clearAllScans: () => apiRequest('/scans', { method: 'DELETE' }),

  // Dashboard & Profile
  getDashboardStats: () => apiRequest('/dashboard/stats'),
  getProfile: () => apiRequest('/profile'),
  updateProfile: (payload: any) => apiRequest('/profile', { method: 'PUT', body: JSON.stringify(payload) }),
  deleteAccount: () => apiRequest('/profile', { method: 'DELETE' }),

  // Health
  checkHealth: () => apiRequest('/health')
};
