import type { Book } from '@/app/types/zlib';

export const SAVED_BOOKS_KEY = 'folio:saved-books';
const SAVED_BOOKS_CHANGED_EVENT = 'folio:saved-books-changed';

export function getSavedBooksSnapshot(): string {
  return window.localStorage.getItem(SAVED_BOOKS_KEY) ?? '';
}

export function parseSavedBooks(raw: string): Book[] {
  try {
    return raw ? (JSON.parse(raw) as Book[]) : [];
  } catch {
    return [];
  }
}

export function readSavedBooks(): Book[] {
  return parseSavedBooks(getSavedBooksSnapshot());
}

export function writeSavedBooks(books: Book[]): void {
  window.localStorage.setItem(SAVED_BOOKS_KEY, JSON.stringify(books));
  window.dispatchEvent(new Event(SAVED_BOOKS_CHANGED_EVENT));
}

// Lets components re-render when the saved list changes, in this tab
// (via the custom event) or in another tab (via the storage event).
export function subscribeToSavedBooks(onChange: () => void): () => void {
  window.addEventListener('storage', onChange);
  window.addEventListener(SAVED_BOOKS_CHANGED_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(SAVED_BOOKS_CHANGED_EVENT, onChange);
  };
}
