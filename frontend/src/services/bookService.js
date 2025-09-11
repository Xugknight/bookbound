import { getToken } from './authService';

export async function createBook({ workKey, title, authors = [], coverId = null }) {
  const token = getToken();
  const res = await fetch('/api/books', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ workKey, title, authors, coverId })
  });
  const err = await safeJson(res);
  if (!res.ok) throw new Error(err?.message || `Add Failed (${res.status})`);
  return err || res.json();
}

export async function listBooks({ page = 1, limit = 10, q = '', status = '' } = {}) {
  const token = getToken();
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q.trim()) params.set('q', q.trim());
  if (status) params.set('status', status);
  const res = await fetch(`/api/books?${params.toString()}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  });
  const err = await safeJson(res);
  if (!res.ok) throw new Error(err?.message || `List Failed (${res.status})`);
  return err || res.json();
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}