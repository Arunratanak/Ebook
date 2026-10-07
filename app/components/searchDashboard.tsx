'use client';

import React, { useState, FormEvent } from 'react';
import { Book, SearchRequestBody, DownloadRequestBody } from '@/app/types/zlib';

export default function SearchDashboard(): React.JSX.Element {
  const [query, setQuery] = useState<string>('');
  const [extension, setExtension] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

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
    
    const bodyPayload: DownloadRequestBody = {
      id: book.id,
      hash: book.hash,
      title: book.title,
      extension: book.extension,
    };

    try {
      const response = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });

      if (!response.ok) throw new Error('Download execution failed');

      // Convert server response into binary block and trigger anchor click
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${book.extension}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert('Could not download file. Daily account limits may be reached.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
      {/* Search Header and Filter Form Strip */}
      <form id="search" onSubmit={handleSearch} className="flex flex-wrap gap-4 bg-zinc-900 p-4 rounded-lg mb-8 items-center border border-zinc-800">
        <input 
          type="text" 
          value={query} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
          placeholder="Search books, authors, ISBNs..."
          className="flex-1 bg-zinc-800 border border-zinc-700 p-2.5 rounded text-white outline-none focus:border-red-600 transition"
        />
        <select 
          value={extension} 
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setExtension(e.target.value)} 
          className="bg-zinc-800 p-2.5 border border-zinc-700 rounded text-white outline-none focus:border-red-600 cursor-pointer"
        >
          <option value="">All Formats</option>
          <option value="epub">EPUB</option>
          <option value="pdf">PDF</option>
          <option value="mobi">MOBI</option>
        </select>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 font-medium px-6 py-2.5 rounded transition text-center min-w-[120px]"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div role="alert" className="mb-8 rounded-lg border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Netflix Dashboard Interface Output */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {results.map((book) => (
          <div 
            key={book.id} 
            className="bg-zinc-900 rounded p-3 flex flex-col group relative transition-all duration-300 hover:scale-105 hover:bg-zinc-850 border border-zinc-800 shadow-md"
          >
            {/* Aspect Ratio Balanced Cover Frame */}
            <div className="aspect-[2/3] bg-zinc-800 rounded mb-2.5 overflow-hidden relative shadow-inner flex items-center justify-center">
              {book.coverUrl ? (
                <img 
                  src={book.coverUrl} 
                  alt={book.title} 
                  className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                  loading="lazy"
                />
              ) : (
                <div className="p-3 text-xs text-zinc-500 text-center font-medium line-clamp-4">
                  {book.title}
                </div>
              )}
            </div>
            
            {/* Meta Text Elements */}
            <h3 className="font-bold text-sm text-zinc-100 truncate w-full group-hover:text-white" title={book.title}>
              {book.title}
            </h3>
            <p className="text-xs text-zinc-400 truncate w-full mt-0.5" title={book.author}>
              {book.author || 'Unknown Author'}
            </p>
            
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">
                {book.extension}
              </span>
              {book.year > 0 && (
                <span className="text-[10px] text-zinc-500 font-medium">
                  {book.year}
                </span>
              )}
            </div>

            {/* Micro Interaction Button Layer */}
            <button 
              onClick={() => handleDownload(book)} 
              disabled={downloadingId !== null}
              className="mt-4 text-xs w-full bg-zinc-800 hover:bg-white hover:text-black disabled:bg-zinc-800 disabled:text-zinc-600 py-2 rounded transition font-bold tracking-wide border border-zinc-700 hover:border-white shadow-sm"
            >
              {downloadingId === book.id ? '⏳ Downloading...' : '📥 Get Book'}
            </button>
          </div>
        ))}
      </div>

      {/* Empty State Banner */}
      {!loading && !error && results.length === 0 && (
        <div className="w-full text-center py-24 text-zinc-500 border border-dashed border-zinc-800 rounded-lg bg-zinc-900/30">
          <p className="text-sm">Your media server dashboard is empty.</p>
          <p className="text-xs mt-1 text-zinc-600">Enter a query parameter to crawl the catalog.</p>
        </div>
      )}
    </div>
  );
}
