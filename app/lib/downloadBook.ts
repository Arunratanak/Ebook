import type { Book } from '@/app/types/zlib';

/**
 * Fetches a book file from /api/download and returns it as a Blob.
 * Throws if the request fails so callers can show their own error message.
 */
export async function requestBookFile(
  book: Pick<Book, 'id' | 'hash' | 'title' | 'extension'>
): Promise<Blob> {
  const response = await fetch('/api/download', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: book.id,
      hash: book.hash,
      title: book.title,
      extension: book.extension,
    }),
  });

  if (!response.ok) throw new Error('Download execution failed');

  return response.blob();
}

/**
 * Requests a book file from /api/download and saves it through the browser.
 * Throws if the request fails so callers can show their own error message.
 */
export async function downloadBookFile(book: Book): Promise<void> {
  const blob = await requestBookFile(book);
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${book.extension}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
