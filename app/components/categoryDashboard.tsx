'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Book } from '@/app/types/zlib';
import BookDetailModal from './bookDetailModal';
import { downloadBookFile } from '@/app/lib/downloadBook';

type CategoryDashboardProps = {
  title: string;
  keyword: string;
};

const CATEGORY_LIMIT = 50;

export default function CategoryDashboard({ title, keyword }: CategoryDashboardProps): React.JSX.Element {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: keyword, limit: CATEGORY_LIMIT, order: 'popular' }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load books');
        setBooks((data.books ?? []) as Book[]);
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Error loading category books:', err);
        setBooks([]);
        setError(err instanceof Error ? err.message : 'Could not load books');
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [keyword]);

  const handleDownload = async (book: Book): Promise<void> => {
    setDownloadingId(book.id);

    try {
      await downloadBookFile(book);
    } catch (err) {
      console.error(err);
      alert('Could not download file. Daily account limits may be reached.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="search-dashboard">
      <div className="search-back-row">
        <Link href="/" className="search-back">
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
      </div>

      <header className="page-header">
        <h1 className="page-header__title">{title}</h1>
        <p className="page-header__count">
          {loading ? 'Loading top books...' : `Top ${books.length} books`}
        </p>
      </header>

      {error && (
        <div role="alert" className="search-error">
          {error}
        </div>
      )}

      {books.length > 0 && (
        <div className="book-grid">
          {books.map((book) => (
            <div key={book.id} className="book-card">
              <button
                type="button"
                onClick={() => setSelectedBook(book)}
                className="book-card__open"
                aria-label={`Open details for ${book.title}`}
              >
                <div className="book-card__cover">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="book-card__image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="book-card__placeholder">
                      {book.title}
                    </div>
                  )}
                </div>
              </button>

              <h3 className="book-card__title" title={book.title}>
                {book.title}
              </h3>
              <p className="book-card__author" title={book.author}>
                {book.author || 'Unknown Author'}
              </p>

              <div className="book-card__meta">
                <span className="book-card__format">
                  {book.extension}
                </span>
                {book.year > 0 && (
                  <span className="book-card__year">
                    {book.year}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleDownload(book)}
                disabled={downloadingId !== null}
                className="book-card__download"
              >
                {downloadingId === book.id ? '⏳ Downloading...' : '📥 Get Book'}
              </button>
            </div>
          ))}
        </div>
      )}

      <BookDetailModal
        book={selectedBook}
        downloadingId={downloadingId}
        onClose={() => setSelectedBook(null)}
        onSelectBook={setSelectedBook}
        onDownload={handleDownload}
      />

      {!loading && !error && books.length === 0 && (
        <div className="search-empty">
          <p>No books found for {title}.</p>
        </div>
      )}
    </div>
  );
}
