/* eslint-disable */
import { useEffect, useState } from 'react';
import { searchOpenLibrary, coverUrl } from '../../services/olService';
import { createBook, listBooks } from '../../services/bookService';


export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState([]);
  const [numFound, setNumFound] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [addedKeys, setAddedKeys] = useState(new Set());

  useEffect(() => {
  let isCancelled = false;
  async function loadSaved() {
    try {
      const { data } = await listBooks({ page: 1, limit: 500 });
      if (!isCancelled) setAddedKeys(new Set(data.map((b) => b.workKey)));
    } catch (_ignored) {
      return;
    }
  }
  loadSaved();
  return () => { isCancelled = true; };
}, []);

  async function runSearch(nextPage = 1) {
    if (!query.trim()) {
      setResults([]); setNumFound(0); setPage(1); return;
    }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await searchOpenLibrary({ query, page: nextPage });
      setResults(data.results || []);
      setNumFound(data.numFound || 0);
      setPage(data.page || nextPage);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAdd(book) {
    try {
      await createBook({
        workKey: book.workKey,
        title: book.title,
        authors: book.authors || [],
        coverId: book.coverId ?? null
      });
      setAddedKeys(prev => new Set(prev).add(book.workKey));
    } catch (err) {
      setErrorMessage(err.message);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    runSearch(1);
  }

  useEffect(() => {
    if (page !== 1) runSearch(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(numFound / 20));

  return (
    <section className="stack" style={{ display: 'grid', gap: '1rem' }}>
      <div className="card">
        <h2 style={{ margin: 0 }}>Search Open Library</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '.5rem', marginTop: '.75rem' }}>
          <input
            type="search"
            placeholder="Title, Author, Keywords…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
          />
          <button className="primary" type="submit" disabled={isLoading}>Search</button>
        </form>
        {errorMessage && <p className="muted" style={{ color: '#f87171' }}>{errorMessage}</p>}
      </div>

      {isLoading && <div className="card">Loading…</div>}

      {!isLoading && results.length === 0 && query.trim() && (
        <div className="card">No results for “{query}”.</div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="card" style={{ display: 'grid', gap: '.75rem' }}>
          <div className="muted small">{numFound.toLocaleString()} found</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '.75rem' }}>
            {results.map((book) => {
              const src = coverUrl(book.coverId, 'M');
              const authors = book.authors?.join(', ') || 'Unknown Author';
              return (
                <li key={book.workKey}
                  style={{ display: 'grid', gridTemplateColumns: '64px 1fr auto', gap: '.75rem', alignItems: 'center' }}>
                  <div style={{
                    width: 64, height: 96, background: '#2A2231', border: '1px solid var(--border)',
                    borderRadius: '8px', display: 'grid', placeItems: 'center', overflow: 'hidden'
                  }}>
                    {src ? <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span className="muted small">No cover</span>}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{book.title}</div>
                    <div className="muted small">{authors}</div>
                    {book.firstPublishYear && (
                      <div className="muted small">First published: {book.firstPublishYear}</div>
                    )}
                    <a
                      href={`https://openlibrary.org${book.workKey}`}
                      target="_blank"
                      rel="noreferrer"
                      className="muted small"
                      style={{ display: 'inline-block', marginTop: '.25rem' }}
                    >
                      View on Open Library ↗
                    </a>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => handleAdd(book)}
                      disabled={addedKeys.has(book.workKey)}
                      title={addedKeys.has(book.workKey) ? 'Already in Your List' : 'Add to Reading List'}
                    >
                      {addedKeys.has(book.workKey) ? 'Added' : 'Add'}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center', justifyContent: 'space-between', marginTop: '.5rem' }}>
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
            <span className="muted small">Page {page} of {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
          </div>
        </div>
      )}
    </section>
  );
}