'use client';

import React, { useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Book } from '@/app/types/zlib';
import BookDetailModal from './bookDetailModal';
import { downloadBookFile } from '@/app/lib/downloadBook';
import {
  getSavedBooksSnapshot,
  parseSavedBooks,
  subscribeToSavedBooks,
  writeSavedBooks,
} from '@/app/lib/savedBooks';

export default function SavedBooksDashboard(): React.JSX.Element {
  // The server snapshot is null, so the list shows "Loading..." until the
  // browser reads localStorage. This keeps server and client renders identical.
  const rawSaved = useSyncExternalStore(subscribeToSavedBooks, getSavedBooksSnapshot, () => null);
  const savedBooks = useMemo(
    () => (rawSaved === null ? null : parseSavedBooks(rawSaved)),
    [rawSaved]
  );
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleRemove = (book: Book): void => {
    writeSavedBooks((savedBooks ?? []).filter((saved) => saved.id !== book.id));
  };

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

  const books = savedBooks ?? [];

  return (
    <div className="search-dashboard">
      <div className="search-back-row">
        <Link href="/" className="search-back">
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
      </div>

      <header className="page-header">
        <h1 className="page-header__title">My List</h1>
        <p className="page-header__count">
          {savedBooks === null ? 'Loading...' : `${books.length} saved ${books.length === 1 ? 'book' : 'books'}`}
        </p>
      </header>

      {savedBooks !== null && books.length > 0 && (
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
              <button
                type="button"
                onClick={() => handleRemove(book)}
                className="saved-card__remove"
              >
                Remove
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

      {savedBooks !== null && books.length === 0 && (
        <div className="search-empty">
          <p>Your list is empty.</p>
          <p>Open a book and press Save to add it here.</p>
        </div>
      )}
    </div>
  );
}
