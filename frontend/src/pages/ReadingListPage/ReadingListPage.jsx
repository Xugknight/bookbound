import { useEffect, useState, useCallback } from 'react';
import { listBooks, removeBook, updateBookStatus } from '../../services/bookService';
import { coverUrl } from '../../services/olService';

export default function ReadingListPage() {
  const [books, setBooks] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const { data, total, pages } = await listBooks({ page, limit: 10, status: statusFilter });
      setBooks(data);
      setTotalCount(total);
      setTotalPages(pages);
    } catch (e) {
      setErrorMessage(e.message);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => { load(); }, [load]);

  async function handleStatusChange(bookId, nextStatus) {
    try {
      setBooks(prev => prev.map(b => b._id === bookId ? { ...b, status: nextStatus } : b));
      await updateBookStatus(bookId, nextStatus);
    } catch (e) {
      setErrorMessage(e.message);
      load();
    }
  };

  async function handleRemove(id) {
    if (!window.confirm('Remove This Book?')) return;

    const wasLastOnPage = books.length === 1 && page > 1;

    try {
      await removeBook(id);
      setBooks((prev) => prev.filter(b => b._id !== id));
      setTotalCount((n) => Math.max(0, n - 1));
      if (wasLastOnPage) setPage(p => Math.max(1, p - 1));
    } catch (e) {
      setErrorMessage(e.message);
    }
  }

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
          <div className="muted small">{totalCount} total</div>
        </div>
      </div>

      {errorMessage && <div className="card" style={{ color: '#f87171' }}>{errorMessage}</div>}
      {isLoading && <div className="card">Loading…</div>}
      {!isLoading && books.length === 0 && <div className="card">No Books Yet. Add From Search.</div>}

      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '.75rem' }}>
        {books.map((book) => (
          <li
            key={book._id}
            className="card"
            style={{ display: 'grid', gridTemplateColumns: '48px 1fr auto auto', gap: '.75rem', alignItems: 'center' }}
          >
            <div style={{ width: 48, height: 72, border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: '#2A2231', display: 'grid', placeItems: 'center' }}>
              {book.coverId
                ? <img alt="" src={coverUrl(book.coverId, 'S')} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <span className="muted small">No Cover</span>}
            </div>

            <div>
              <div style={{ fontWeight: 600 }}>{book.title}</div>
              <div className="muted small">{(book.authors || []).join(', ') || 'Unknown author'}</div>
            </div>

            <select
              aria-label="Change status"
              value={book.status || 'to-read'}
              onChange={(e) => handleStatusChange(book._id, e.target.value)}
            >
              <option value="to-read">To-Read</option>
              <option value="reading">Reading</option>
              <option value="done">Done</option>
            </select>

            <button className="danger" onClick={() => handleRemove(book._id)} type="button">Remove</button>
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