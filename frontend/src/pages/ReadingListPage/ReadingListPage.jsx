import { useEffect, useState, useCallback } from 'react';
import { listBooks, removeBook, updateBookStatus, updateBookNotes, updateBookRating } from '../../services/bookService';
import { coverUrl } from '../../services/olService';

const VALID_STATUSES = ['to-read', 'reading', 'done'];
const VALID_SORTS = ['added', 'title', 'author', 'status'];

export default function ReadingListPage() {
  const [books, setBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [confirmingDeleteId, setConfirmingDeleteId] = useState(null);
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');

  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = parseInt(params.get('page') || '1', 10);
    return Number.isFinite(fromUrl) && fromUrl > 1 ? fromUrl : 1;
  });

  const [statusFilter, setStatusFilter] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const s = (params.get('status') || '').trim();
    return VALID_STATUSES.includes(s) ? s : '';
  });

  const [query, setQuery] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return (params.get('q') || '').trim();
  });

  const [sortKey, setSortKey] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const s = (params.get('sort') || 'added').trim();
    return VALID_SORTS.includes(s) ? s : 'added';
  });

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(id);
  }, [query]);

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { data, total, pages } = await listBooks({
        page,
        limit: 10,
        status: statusFilter,
        q: debouncedQuery,
        sort: sortKey,
      });
      setBooks(data);
      setTotalCount(total);
      setTotalPages(pages);
    } catch (e) {
      setErrorMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, debouncedQuery, sortKey]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (confirmingDeleteId && !books.some(b => b._id === confirmingDeleteId)) {
      setConfirmingDeleteId(null);
    }
  }, [books, confirmingDeleteId]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (page > 1) params.set('page', String(page));
    if (statusFilter) params.set('status', statusFilter);
    if (query.trim()) params.set('q', query.trim());
    if (sortKey && sortKey !== 'added') params.set('sort', sortKey);
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [page, statusFilter, query, sortKey]);

  function requestRemove(bookId) {
    setConfirmingDeleteId(bookId);
  };

  function cancelRemove() {
    setConfirmingDeleteId(null);
  };

  async function confirmRemove(bookId) {
    const ok = await handleRemove(bookId);
    if (ok) setConfirmingDeleteId(null);
  };

  async function handleRemove(id) {
    const wasLastOnPage = books.length === 1 && page > 1;
    try {
      await removeBook(id);
      setBooks(prev => prev.filter(b => b._id !== id));
      setTotalCount(n => Math.max(0, n - 1));
      if (wasLastOnPage) setPage(p => Math.max(1, p - 1));
      return true;
    } catch (e) {
      setErrorMessage(e.message);
      return false;
    }
  };

  function onConfirmKeyDown(e, id) {
    if (e.key === 'Enter') { e.preventDefault(); confirmRemove(id); }
    if (e.key === 'Escape') { e.preventDefault(); cancelRemove(); }
  };

  function onConfirmBlur(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) cancelRemove();
  };

  async function handleStatusChange(bookId, nextStatus) {
    try {
      setBooks(prev => prev.map(b => b._id === bookId ? { ...b, status: nextStatus } : b));
      await updateBookStatus(bookId, nextStatus);
    } catch (e) {
      setErrorMessage(e.message);
      load();
    }
  };

  function beginEditNotes(book) {
    setEditingNotesId(book._id);
    setNotesDraft(book.notes || '');
  };

  function cancelEditNotes() {
    setEditingNotesId(null);
    setNotesDraft('');
  };

  async function saveNotes(bookId) {
    const prev = books;
    try {
      setBooks(p => p.map(b => b._id === bookId ? { ...b, notes: notesDraft } : b)); // optimistic
      await updateBookNotes(bookId, notesDraft);
      setEditingNotesId(null);
      setNotesDraft('');
    } catch (e) {
      setErrorMessage(e.message);
      setBooks(prev);
    }
  };

  async function handleRatingChange(bookId, nextRating) {
    const prev = books;
    try {
      setBooks(p => p.map(b => b._id === bookId ? { ...b, rating: nextRating } : b));
      await updateBookRating(bookId, nextRating);
    } catch (e) {
      setErrorMessage(e.message);
      setBooks(prev);
    }
  };

  return (
    <section className="stack">
      <div
        className="toolbar"
        style={{ display: 'flex', gap: '.5rem', alignItems: 'center', justifyContent: 'space-between' }}
      >
        <h2 style={{ margin: 0 }}>My Reading List</h2>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <label className="small muted" htmlFor="statusFilter">Filter:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => { setPage(1); setStatusFilter(e.target.value); }}
          >
            <option value="">All</option>
            <option value="to-read">To-Read</option>
            <option value="reading">Reading</option>
            <option value="done">Done</option>
          </select>

          <label className="small muted" htmlFor="sortKey">Sort:</label>
          <select
            id="sortKey"
            value={sortKey}
            onChange={(e) => { setPage(1); setSortKey(e.target.value); }}
          >
            <option value="added">Recently Added</option>
            <option value="title">Title (A–Z)</option>
            <option value="author">Author (A–Z)</option>
            <option value="status">Status</option>
          </select>

          <input
            className="search"
            type="search"
            placeholder="Search your list…"
            value={query}
            onChange={(e) => { setPage(1); setQuery(e.target.value); }}
            style={{ width: '16rem' }}
            aria-label="Search in my reading list"
          />
          {query && (
            <button
              type="button"
              className="icon-button"
              title="Clear search"
              aria-label="Clear search"
              onClick={() => { setQuery(''); setPage(1); }}
            >
              Clear
            </button>
          )}

          <div className="muted small">{totalCount} total</div>
        </div>
      </div>

      {errorMessage && (
        <div className="card" style={{ color: '#f87171' }} role="status" aria-live="polite">
          {errorMessage}
        </div>
      )}
      {isLoading && <div className="card">Loading…</div>}
      {!isLoading && books.length === 0 && <div className="card">No Books Yet. Add From Search.</div>}

      <ul
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gap: '.75rem'
        }}
      >
        {books.map((book) => (
          <li
            key={book._id}
            className="card"
            style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr minmax(220px, 2fr) auto auto auto',
              gap: '.75rem',
              alignItems: 'start'
            }}
          >
            <div style={{
              width: 48, height: 72, border: '1px solid var(--border)',
              borderRadius: 8, overflow: 'hidden', background: '#2A2231',
              display: 'grid', placeItems: 'center'
            }}>
              {book.coverId
                ? <img alt="" src={coverUrl(book.coverId, 'S')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span className="muted small">No Cover</span>}
            </div>

            <div>
              <div style={{ fontWeight: 600 }}>{book.title}</div>
              <div className="muted small">{(book.authors || []).join(', ') || 'Unknown author'}</div>
            </div>

            <div className="stack small" style={{ minWidth: 220 }}>
              {editingNotesId === book._id ? (
                <div className="stack">
                  <textarea
                    rows={3}
                    value={notesDraft}
                    onChange={(e) => setNotesDraft(e.target.value)}
                    maxLength={2000}
                    placeholder="Add notes…"
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'flex', gap: '.5rem' }}>
                    <button className="primary" type="button" onClick={() => saveNotes(book._id)}>Save</button>
                    <button type="button" onClick={cancelEditNotes}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div>
                  {book.notes
                    ? (
                      <div
                        className="muted small notes-snippet"
                        style={{ whiteSpace: 'pre-wrap' }}
                      >
                        {book.notes}
                      </div>
                    )
                    : <div className="muted small" style={{ fontStyle: 'italic' }}>No notes</div>}
                  <button type="button" onClick={() => beginEditNotes(book)}>Notes</button>
                </div>
              )}
            </div>

            <StarRating
              value={book.rating ?? 0}
              onChange={(r) => handleRatingChange(book._id, r || null)}
              label={`Rate ${book.title}`}
            />

            <select
              aria-label="Change status"
              value={book.status || 'to-read'}
              onChange={(e) => handleStatusChange(book._id, e.target.value)}
            >
              <option value="to-read">To-Read</option>
              <option value="reading">Reading</option>
              <option value="done">Done</option>
            </select>

            {confirmingDeleteId === book._id ? (
              <div
                className="inline-confirm"
                role="group"
                aria-label="Confirm removal"
                onKeyDown={(e) => onConfirmKeyDown(e, book._id)}
                onBlur={onConfirmBlur}
              >
                <span className="muted small">Remove?</span>
                <button className="danger" type="button" onClick={() => confirmRemove(book._id)} autoFocus>
                  Yes
                </button>
                <button type="button" onClick={cancelRemove}>No</button>
              </div>
            ) : (
              <button
                className="danger"
                type="button"
                onClick={() => requestRemove(book._id)}
                aria-haspopup="true"
                aria-expanded={confirmingDeleteId === book._id}
              >
                Remove
              </button>
            )}
          </li>
        ))}
      </ul>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Next</button>
      </div>
    </section>
  );
}

function StarRating({ value = 0, onChange, label = 'Rating' }) {
  return (
    <div className="stars" aria-label={label}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          className={`star ${n <= value ? 'filled' : ''}`}
          aria-label={`${n} star${n > 1 ? 's' : ''}`}
          onClick={() => onChange(n)}
        >
          {n <= value ? '★' : '☆'}
        </button>
      ))}
      <button
        type="button"
        className="icon-button"
        aria-label="Clear rating"
        title="Clear rating"
        onClick={() => onChange(0)}
      >
        Clear
      </button>
    </div>
  );
}