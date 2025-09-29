/* eslint-disable */
import { useEffect, useState } from 'react';
import { searchOpenLibrary, coverUrl } from '../../services/olService';
import { createBook, listBooks } from '../../services/bookService';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [hasSearched, setHasSearched] = useState(false);
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
      } catch (_ignored) { }
    }
    loadSaved();
    return () => { isCancelled = true; };
  }, []);

  async function runSearch(nextPage = 1) {
    if (!query.trim()) { setResults([]); setNumFound(0); setPage(1); return; }
    setIsLoading(true);
    setErrorMessage('');
    try {
      const data = await searchOpenLibrary({ query, page: nextPage, limit });
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
    setHasSearched(true);
    runSearch(1);
  }


  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page !== 1) runSearch(page);
  }, [page]);

  useEffect(() => {
    setPage(1);
    if (query.trim()) { setHasSearched(true); runSearch(1); }
  }, [limit]);

  const totalPages = Math.max(1, Math.ceil(numFound / limit));

  return (
    <section className="center-page">
      <div className="page-card card">
        <h1 className="page-title">Search Open Library</h1>
        <form className="search-form" onSubmit={handleSubmit}>
          <input
            type="search"
            name='query'
            placeholder="Title, Author, Keywords…"
            value={query}
            onChange={(e) => { setQuery(e.target.value); }}
          />
          <button className="primary" type="submit" disabled={isLoading}>Search</button>

          {hasSearched && (
            <div className="card results-toolbar">
              <div className="toolbar__group toolbar__group--center">
                <label htmlFor="perPage" className="small muted">Results per page</label>
                <select
                  id="perPage"
                  value={limit}
                  onChange={(e) => setLimit(parseInt(e.target.value, 10))}
                  aria-label="Results per page"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          )}

        </form>
        {errorMessage && <p className="muted text-error">{errorMessage}</p>}
      </div>

      {isLoading && <div className="card">Loading…</div>}

      {!isLoading && results.length === 0 && query.trim() && (
        <div className="card">No results for “{query}”.</div>
      )}

      {!isLoading && results.length > 0 && (
        <div className="decor-grid">
          <div className="card search-results">
            <div className="muted small">{numFound.toLocaleString()} found</div>
            <ul className="book-list">
              {results.map((book) => {
                const src = coverUrl(book.coverId, 'M');
                const authors = book.authors?.join(', ') || 'Unknown Author';
                return (
                  <li key={book.workKey} className="book-item book-item--search">
                    <div className="cover cover--md">
                      {src ? <img src={src} alt="" /> : <span className="muted small">No cover</span>}
                    </div>
                    <div>
                      <div className="book-title">{book.title}</div>
                      <div className="muted small">{authors}</div>
                      {book.firstPublishYear && (
                        <div className="muted small">First published: {book.firstPublishYear}</div>
                      )}
                      <a
                        href={`https://openlibrary.org${book.workKey}`}
                        target="_blank"
                        rel="noreferrer"
                        className="muted small link-inline"
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

            <div className="pagination">
              <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</button>
              <span className="muted small">Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}