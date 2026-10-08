'use client';

import React, { useState, FormEvent } from 'react';
import Link from 'next/link';
import { Book, SearchRequestBody } from '@/app/types/zlib';
import BookDetailModal from './bookDetailModal';
import { downloadBookFile } from '@/app/lib/downloadBook';

export default function SearchDashboard(): React.JSX.Element {
  const [query, setQuery] = useState<string>('');
  const [extension, setExtension] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const handleSearch = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const bodyPayload: SearchRequestBody = {
      query,
      ...(extension && { extension }),
      ...(language && { language }),
    };

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Search failed');
      }
      setResults(data.books || []);
    } catch (err) {
      console.error('Error fetching search entries:', err);
      setResults([]);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="search-dashboard">
      {/* Back to home navigation */}
      <div className="search-back-row">
        <Link href="/" className="search-back">
          <span aria-hidden="true">←</span>
          Back to home
        </Link>
      </div>

      {/* Search Header and Filter Form Strip */}
      <form id="search" onSubmit={handleSearch} className="search-form">
        <input 
          type="text" 
          value={query} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder="Search books, authors, ISBNs..."
          className="search-form__input"
        />
        <select 
          value={extension} 
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setExtension(e.target.value)} 
          className="search-form__select"
        >
          <option value="">All Formats</option>
          <option value="epub">EPUB</option>
          <option value="pdf">PDF</option>
          <option value="mobi">MOBI</option>
        </select>
        <button 
          type="submit" 
          disabled={loading}
          className="search-form__button"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div role="alert" className="search-error">
          {error}
        </div>
      )}

      {/* Netflix Dashboard Interface Output */}
      <div className="book-grid">
        {results.map((book) => (
          <div 
            key={book.id} 
            className="book-card"
          >
            {/* Aspect Ratio Balanced Cover Frame */}
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

            {/* Meta Text Elements */}
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

            {/* Micro Interaction Button Layer */}
            <button 
              onClick={() => handleDownload(book)} 
              disabled={downloadingId !== null}
              className="book-card__download"
            >
              {downloadingId === book.id ? '⏳ Downloading...' : '📥 Get Book'}
            </button>
          </div>
        ))}
      </div>

      <BookDetailModal
        book={selectedBook}
        downloadingId={downloadingId}
        onClose={() => setSelectedBook(null)}
        onSelectBook={setSelectedBook}
        onDownload={handleDownload}
      />

      {/* Empty State Banner */}
      {!loading && !error && results.length === 0 && (
        <div className="search-empty">
          <p>Your media server dashboard is empty.</p>
          <p>Enter a query parameter to crawl the catalog.</p>
        </div>
      )}
    </div>
  );
}
