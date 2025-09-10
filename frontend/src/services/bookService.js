export async function createBook({ workKey, title, authors = [], coverId = null }) {
  const res = await fetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workKey, title, authors, coverId })
  });
  if (!res.ok) {
    let msg = 'Add failed';
    try { const err = await res.json(); if (err?.message) msg = err.message; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function listBooks({ page = 1, limit = 10, q = '', status = '' } = {}) {
  const params = new URLSearchParams();
  params.set('page', String(page));
  params.set('limit', String(limit));
  if (q.trim()) params.set('q', q.trim());
  if (status) params.set('status', status);
  const res = await fetch(`/api/books?${params.toString()}`);
  if (!res.ok) throw new Error(`List failed (${res.status})`);
  return res.json();
}