/**
 * apiFetch — Wrapper quanh fetch() tự động gắn Authorization header.
 * Sử dụng thay cho fetch() trực tiếp trong toàn bộ app.
 *
 * Usage:
 *   import { apiFetch } from '../../utils/api';
 *   const res = await apiFetch('/posts');
 *   const res = await apiFetch('/posts', { method: 'POST', body: JSON.stringify(data) });
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

function getToken(): string | null {
  return localStorage.getItem('sh_token');
}

export async function apiFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only default to application/json if it's not a FormData upload
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Support both absolute URLs (for non-/api/v1 paths like /api/admin/...)
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  try {
    const response = await fetch(url, { ...options, headers });
    
    // Global error handling for 401 Unauthorized
    if (response.status === 401) {
      localStorage.removeItem('sh_token');
      localStorage.removeItem('sh_user');
      window.location.href = '/login';
      return response;
    }
    
    // Global error handling for 500
    if (response.status >= 500) {
      console.error('[API] Server Error:', url);
    }
    
    return response;
  } catch (error) {
    console.error('[API] Network Error:', error);
    throw error;
  }
}

/**
 * apiFetchAbsolute — Gửi request đến URL tuyệt đối (ví dụ /api/admin/...).
 * Tự động gắn BASE_HOST (không có /api/v1).
 */
const BASE_HOST = (() => {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';
  return base.replace('/api/v1', '');
})();

export async function apiFetchAdmin(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${BASE_HOST}${path}`, { ...options, headers });
    
    if (response.status === 401) {
      localStorage.removeItem('sh_token');
      localStorage.removeItem('sh_user');
      window.location.href = '/login';
    }
    
    return response;
  } catch (error) {
    console.error('[API Admin] Network Error:', error);
    throw error;
  }
}

export { BASE_URL, BASE_HOST };
