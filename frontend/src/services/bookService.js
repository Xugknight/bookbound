/* eslint-disable */
import { getToken } from './authService';

function withAuth(headers = {}) {
  const token = getToken();
  return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
};

export async function createBook({ workKey, title, authors = [], coverId = null }) {
  const res = await fetch('/api/books', {
    method: 'POST',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ workKey, title, authors, coverId })
  });
  const payload = await safeJson(res);
  if (!res.ok) throw new Error(payload?.message || `Add Failed (${res.status})`);
  return payload;
}

export async function listBooks({ page = 1, limit = 10, q = '', status = '', sort = 'added' } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (q.trim()) params.set('q', q.trim());
  if (status) params.set('status', status);
  if (sort) params.set('sort', sort);

  const res = await fetch(`/api/books?${params.toString()}`, {
    headers: withAuth()
  });
  const payload = await safeJson(res);
  if (!res.ok) throw new Error(payload?.message || `List Failed (${res.status})`);
  return payload;
}

export async function removeBook(id) {
  const res = await fetch(`/api/books/${id}`, {
    method: 'DELETE',
    headers: withAuth()
  });
  const payload = await safeJson(res);
  if (!res.ok) throw new Error(payload?.message || `Delete Failed (${res.status})`);
  return payload;
}

export async function updateBookStatus(id, status) {
  const res = await fetch(`/api/books/${id}/status`, {
    method: 'PATCH',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ status })
  });
  const payload = await safeJson(res);
  if (!res.ok) throw new Error(payload?.message || `Update Failed (${res.status})`);
  return payload;
};

async function safeJson(res) {
  try { return await res.json(); } catch { return null; }
}

export async function updateBookNotes(id, notes) {
  const res = await fetch(`/api/books/${id}/notes`, {
    method: 'PATCH',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ notes })
  });
  const payload = await safeJson(res);
  if (!res.ok) throw new Error(payload?.message || `Update Failed (${res.status})`);
  return payload;
}

export async function updateBookRating(id, rating) {
  const res = await fetch(`/api/books/${id}/rating`, {
    method: 'PATCH',
    headers: withAuth({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ rating })
  });
  const payload = await safeJson(res);
  if (!res.ok) throw new Error(payload?.message || `Update Failed (${res.status})`);
  return payload;
}