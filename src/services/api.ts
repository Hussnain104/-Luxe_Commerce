export const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('luxe_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getSessionHeader(): Record<string, string> {
  let sessionId = localStorage.getItem('luxe_session_id');
  if (!sessionId) {
    sessionId = `sess_${Math.random().toString(36).substring(2, 12)}`;
    localStorage.setItem('luxe_session_id', sessionId);
  }
  return { 'x-session-id': sessionId };
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; message?: string }> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...getSessionHeader(),
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.message || 'An error occurred while communicating with the server.');
    }
    return json;
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Network error. Please verify your connection.',
    };
  }
}
