export async function createBook({ workKey, title, authors = [], coverId = null }) {
  const res = await fetch('/api/books', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workKey, title, authors, coverId })
  });

  if (!res.ok) {
    const err = await safeJson(res);
    const msg = err?.message || `Add Failed (${res.status})`;
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
  if (!res.ok) {
    const err = await safeJson(res);
    throw new Error(err?.message || `List Failed (${res.status})`);
  }
  return res.json();
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}