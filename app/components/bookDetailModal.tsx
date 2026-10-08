'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Book } from '@/app/types/zlib';
import { readSavedBooks, writeSavedBooks } from '@/app/lib/savedBooks';
import { isReadableExtension } from '@/app/lib/readerFormats';

type BookDetailModalProps = {
  book: Book | null;
  downloadingId: number | null;
  onClose: () => void;
  onSelectBook: (book: Book) => void;
  onDownload: (book: Book) => Promise<void>;
};

type BookDetailContentProps = {
  book: Book;
  downloadingId: number | null;
  onSelectBook: (book: Book) => void;
  onDownload: (book: Book) => Promise<void>;
  onRequestClose: () => void;
};

function isSameAuthor(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = (a ?? '').trim().toLowerCase();
  return left !== '' && left === (b ?? '').trim().toLowerCase();
}

// The reader page gets everything it needs from the query string, so the book
// file is downloaded there rather than passed through app state.
function readerHref(book: Book): string {
  const params = new URLSearchParams({
    id: String(book.id),
    hash: book.hash,
    title: book.title,
    extension: book.extension,
  });
  return `/read?${params.toString()}`;
}

function BookDetailContent({
  book,
  downloadingId,
  onSelectBook,
  onDownload,
  onRequestClose,
}: BookDetailContentProps): React.JSX.Element {
  const hasAuthor = (book.author ?? '').trim() !== '';
  const isReadable = isReadableExtension(book.extension);
  const [description, setDescription] = useState<string | null>(null);
  const [detailsLoading, setDetailsLoading] = useState<boolean>(true);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [otherWorks, setOtherWorks] = useState<Book[]>([]);
  const [worksLoading, setWorksLoading] = useState<boolean>(hasAuthor);
  const [worksError, setWorksError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(() =>
    readSavedBooks().some((saved) => saved.id === book.id)
  );

  // Mounted with key={book.id}, so state starts fresh for each book and this
  // effect only starts the requests without setting state synchronously.
  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: book.id, hash: book.hash }),
      signal: controller.signal,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load book details');
        return data as { book: { description: string | null } };
      })
      .then((data) => setDescription(data.book.description))
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        console.error('Error loading book details:', err);
        setDetailsError(err instanceof Error ? err.message : 'Could not load book details');
      })
      .finally(() => {
        if (!controller.signal.aborted) setDetailsLoading(false);
      });

    if (hasAuthor) {
      fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: book.author }),
        signal: controller.signal,
      })
        .then(async (res) => {
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || 'Could not load other works');
          return data as { books?: Book[] };
        })
        .then((data) =>
          setOtherWorks(
            (data.books ?? []).filter(
              (work) => work.id !== book.id && isSameAuthor(work.author, book.author)
            )
          )
        )
        .catch((err: unknown) => {
          if (controller.signal.aborted) return;
          console.error('Error loading other works:', err);
          setWorksError(err instanceof Error ? err.message : 'Could not load other works');
        })
        .finally(() => {
          if (!controller.signal.aborted) setWorksLoading(false);
        });
    }

    return () => controller.abort();
  }, [book, hasAuthor]);

  const toggleSaved = (): void => {
    const current = readSavedBooks();
    const next = isSaved
      ? current.filter((saved) => saved.id !== book.id)
      : [...current, book];
    writeSavedBooks(next);
    setIsSaved(!isSaved);
  };

  return (
    <>
      <button
        type="button"
        className="book-modal__close"
        aria-label="Close book details"
        onClick={onRequestClose}
      >
        ×
      </button>

      <div className="book-modal__body">
        <div className="book-modal__hero">
          <div className="book-modal__cover">
            {book.coverUrl ? (
              <img src={book.coverUrl} alt="" className="book-modal__image" />
            ) : (
              <div className="book-modal__placeholder">{book.title}</div>
            )}
          </div>

          <div className="book-modal__info">
            <h2 id="book-modal-title" className="book-modal__title">
              {book.title}
            </h2>
            <p className="book-modal__author">{book.author || 'Unknown Author'}</p>
            <div className="book-modal__meta">
              <span className="book-card__format">{book.extension}</span>
              {book.year > 0 && <span className="book-card__year">{book.year}</span>}
            </div>

            <div className="book-modal__actions">
              <button
                type="button"
                onClick={toggleSaved}
                aria-pressed={isSaved}
                className={`book-modal__button ${isSaved ? 'book-modal__button--active' : ''}`}
              >
                {isSaved ? '✓ Saved' : '+ Save'}
              </button>
              <button
                type="button"
                onClick={() => onDownload(book)}
                disabled={downloadingId !== null}
                className="book-modal__button book-modal__button--primary"
              >
                {downloadingId === book.id ? 'Downloading...' : '📥 Download'}
              </button>
              {isReadable ? (
                <Link
                  href={readerHref(book)}
                  className="book-modal__button book-modal__button--link"
                >
                  ▶ Read
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  title="This format cannot be read in the browser yet"
                  className="book-modal__button"
                >
                  ▶ Read
                </button>
              )}
            </div>
          </div>
        </div>

        <section className="book-modal__section" aria-labelledby="book-modal-synopsis">
          <h3 id="book-modal-synopsis">Synopsis</h3>
          {detailsLoading && <p className="book-modal__note">Loading synopsis...</p>}
          {detailsError && (
            <p role="alert" className="book-modal__note">
              {detailsError}
            </p>
          )}
          {!detailsLoading && !detailsError && (
            <p className="book-modal__synopsis">
              {description || 'No synopsis available for this book.'}
            </p>
          )}
        </section>

        <section className="book-modal__section" aria-labelledby="book-modal-works">
          <h3 id="book-modal-works">More by {book.author || 'this author'}</h3>
          {worksLoading && <p className="book-modal__note">Loading other works...</p>}
          {worksError && (
            <p role="alert" className="book-modal__note">
              {worksError}
            </p>
          )}
          {!worksLoading && !worksError && otherWorks.length === 0 && (
            <p className="book-modal__note">No other works found.</p>
          )}
          {otherWorks.length > 0 && (
            <ul className="book-modal__works" aria-label={`Other works by ${book.author}`}>
              {otherWorks.map((work) => (
                <li key={work.id} className="book-modal__work">
                  <button
                    type="button"
                    className="book-modal__work-button"
                    onClick={() => onSelectBook(work)}
                  >
                    <div className="book-modal__work-cover">
                      {work.coverUrl ? (
                        <img src={work.coverUrl} alt="" className="book-modal__image" loading="lazy" />
                      ) : (
                        <div className="book-modal__placeholder">{work.title}</div>
                      )}
                    </div>
                    <span className="book-modal__work-title" title={work.title}>
                      {work.title}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

export default function BookDetailModal({
  book,
  downloadingId,
  onClose,
  onSelectBook,
  onDownload,
}: BookDetailModalProps): React.JSX.Element {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Keep the native dialog in sync with whether a book is selected.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (book && !dialog.open) dialog.showModal();
    if (!book && dialog.open) dialog.close();
  }, [book]);

  const handleBackdropClick = (event: React.MouseEvent<HTMLDialogElement>): void => {
    if (event.target === dialogRef.current) dialogRef.current?.close();
  };

  return (
    <dialog
      ref={dialogRef}
      className="book-modal"
      onClose={onClose}
      onClick={handleBackdropClick}
      aria-labelledby={book ? 'book-modal-title' : undefined}
    >
      {book && (
        <BookDetailContent
          key={book.id}
          book={book}
          downloadingId={downloadingId}
          onSelectBook={onSelectBook}
          onDownload={onDownload}
          onRequestClose={() => dialogRef.current?.close()}
        />
      )}
    </dialog>
  );
}

