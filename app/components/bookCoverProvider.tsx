'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { Book } from '@/app/types/zlib';

type BookCoverContextValue = {
  books: Record<string, Book | null>;
  lookupBook: (title: string) => Promise<void>;
};

const BookCoverContext = createContext<BookCoverContextValue | null>(null);

function keyFor(title: string): string {
  return title.trim().toLowerCase();
}

export function BookCoverProvider({ children }: { children: ReactNode }) {
  const [books, setBooks] = useState<Record<string, Book | null>>({});
  const requested = useRef(new Set<string>());

  const lookupBook = useCallback(async (title: string): Promise<void> => {
    const key = keyFor(title);
    if (!key || requested.current.has(key)) return;

    requested.current.add(key);
    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: title }),
      });
      if (!response.ok) throw new Error(`Book lookup failed for "${title}"`);

      const data: { books?: Book[] } = await response.json();
      setBooks((current) => ({ ...current, [key]: data.books?.[0] ?? null }));
    } catch (error) {
      requested.current.delete(key);
      console.error('Error fetching book cover:', error);
    }
  }, []);

  return (
    <BookCoverContext.Provider value={{ books, lookupBook }}>
      {children}
    </BookCoverContext.Provider>
  );
}

export function useBookCovers(): BookCoverContextValue {
  const context = useContext(BookCoverContext);
  if (!context) {
    throw new Error('useBookCovers must be used within BookCoverProvider');
  }
  return context;
}

export function normalizeBookTitle(title: string): string {
  return keyFor(title).replace(/\s+and\s+/g, ' & ');
}
