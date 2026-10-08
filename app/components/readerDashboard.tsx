'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { requestBookFile } from '@/app/lib/downloadBook';
import { isReadableExtension } from '@/app/lib/readerFormats';

// foliate-js is vendored in public/foliate-js (it is not an npm package), so
// it is loaded at runtime from the public URL. The import below is marked
// webpackIgnore/turbopackIgnore so the bundler leaves that URL alone.
const FOLIATE_VIEW_MODULE: string = '/foliate-js/view.js';

const PREV_KEYS = new Set(['ArrowLeft', 'ArrowUp', 'PageUp']);
const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown', 'PageDown']);

type FoliateView = HTMLElement & {
  open(file: File): Promise<void>;
  close(): void;
  goLeft(): Promise<void>;
  goRight(): Promise<void>;
  goToFraction(fraction: number): Promise<void>;
};

type RelocateDetail = {
  fraction?: number;
  tocItem?: { label?: string } | null;
};

type ReaderRequest = {
  id: number;
  hash: string;
  title: string;
  extension: string;
};

type ReaderStatus = 'loading' | 'ready' | 'error';

// Shares one in-flight download per book. React Strict Mode runs effects twice
// in development, and each download counts against the Z-Library quota.
const pendingBookFiles = new Map<string, Promise<Blob>>();

function loadBookBlob(request: ReaderRequest): Promise<Blob> {
  const key = `${request.id}:${request.hash}`;
  const existing = pendingBookFiles.get(key);
  if (existing) return existing;

  const pending = requestBookFile(request);
  pendingBookFiles.set(key, pending);
  const forget = (): void => {
    pendingBookFiles.delete(key);
  };
  pending.then(forget, forget);
  return pending;
}

function parseReaderRequest(params: Pick<URLSearchParams, 'get'>): ReaderRequest | null {
  const id = Number(params.get('id'));
  const hash = params.get('hash') ?? '';
  const title = params.get('title') ?? '';
  const extension = (params.get('extension') ?? '').trim().toLowerCase();

  if (!Number.isInteger(id) || id <= 0) return null;
  if (hash === '' || !isReadableExtension(extension)) return null;

  return { id, hash, title: title.trim() || 'Untitled', extension };
}

function ReaderMessage({ message }: { message: string }): React.JSX.Element {
  return (
    <div className="reader reader--message">
      <p>{message}</p>
      <Link href="/search" className="search-back">
        <span aria-hidden="true">←</span>
        Back to search
      </Link>
    </div>
  );
}

export default function ReaderDashboard(): React.JSX.Element {
  const searchParams = useSearchParams();
  // Parsed once per URL. null means the link is missing a field or the format
  // is not one the reader can open.
  const request = useMemo(() => parseReaderRequest(searchParams), [searchParams]);

  if (request === null) {
    return <ReaderMessage message="This book link is incomplete or its format cannot be read here." />;
  }

  // Keyed by book so each book starts with fresh state and a fresh viewer.
  return <ReaderView key={`${request.id}:${request.hash}`} request={request} />;
}

function ReaderView({ request }: { request: ReaderRequest }): React.JSX.Element {
  const stageRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<FoliateView | null>(null);
  const [status, setStatus] = useState<ReaderStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fraction, setFraction] = useState<number>(0);
  const [chapter, setChapter] = useState<string>('');

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let cancelled = false;
    let view: FoliateView | null = null;

    const handleRelocate = (event: Event): void => {
      const detail = (event as CustomEvent<RelocateDetail>).detail;
      setFraction(detail.fraction ?? 0);
      setChapter(detail.tocItem?.label ?? '');
    };

    const handleKeydown = (event: KeyboardEvent): void => {
      // Let the progress slider keep its native arrow-key behaviour.
      if (event.target instanceof HTMLInputElement) return;
      if (PREV_KEYS.has(event.key)) {
        event.preventDefault();
        void viewRef.current?.goLeft();
      } else if (NEXT_KEYS.has(event.key)) {
        event.preventDefault();
        void viewRef.current?.goRight();
      }
    };

    // Key events inside a section's iframe do not reach the parent window,
    // so each newly loaded section document needs its own listener.
    const handleLoad = (event: Event): void => {
      const { doc } = (event as CustomEvent<{ doc: Document }>).detail;
      doc.addEventListener('keydown', handleKeydown);
    };

    const start = async (): Promise<void> => {
      try {
        await import(/* webpackIgnore: true */ /* turbopackIgnore: true */ FOLIATE_VIEW_MODULE);
        const blob = await loadBookBlob(request);
        if (cancelled) return;

        // foliate-js detects formats from the file name, so keep the extension.
        const file = new File([blob], `${request.title}.${request.extension}`);
        view = document.createElement('foliate-view') as FoliateView;
        view.addEventListener('relocate', handleRelocate);
        view.addEventListener('load', handleLoad);
        stage.append(view);
        viewRef.current = view;

        await view.open(file);
        if (!cancelled) setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        console.error('Error opening book:', err);
        setErrorMessage(
          err instanceof Error && err.message === 'Download execution failed'
            ? 'Could not download this book. Daily account limits may be reached.'
            : 'This book could not be opened in the reader.'
        );
        setStatus('error');
      }
    };

    window.addEventListener('keydown', handleKeydown);
    void start();

    return () => {
      cancelled = true;
      window.removeEventListener('keydown', handleKeydown);
      viewRef.current = null;
      view?.close();
      view?.remove();
    };
  }, [request]);

  const goPrev = (): void => {
    void viewRef.current?.goLeft();
  };

  const goNext = (): void => {
    void viewRef.current?.goRight();
  };

  const handleSlider = (event: React.ChangeEvent<HTMLInputElement>): void => {
    void viewRef.current?.goToFraction(Number(event.target.value));
  };

  const isReady = status === 'ready';
  const percent = Math.round(fraction * 100);

  return (
    <div className="reader">
      <header className="reader__header">
        <Link href="/search" className="search-back">
          <span aria-hidden="true">←</span>
          Back to search
        </Link>
        <h1 className="reader__title" title={request.title}>
          {request.title}
        </h1>
        <span className="book-card__format">{request.extension}</span>
      </header>

      <div className="reader__stage">
        <div ref={stageRef} className="reader__view" />
        {!isReady && (
          <div className="reader__overlay" role={status === 'error' ? 'alert' : 'status'}>
            {status === 'error' ? errorMessage : 'Opening book...'}
          </div>
        )}
      </div>

      <footer className="reader__footer">
        <button
          type="button"
          onClick={goPrev}
          disabled={!isReady}
          className="reader__nav"
          aria-label="Previous page"
        >
          ‹
        </button>

        <div className="reader__progress">
          <input
            type="range"
            min={0}
            max={1}
            step={0.001}
            value={fraction}
            onChange={handleSlider}
            disabled={!isReady}
            aria-label="Reading position"
          />
          <p className="reader__status">
            {chapter ? `${chapter} · ` : ''}
            {percent}%
          </p>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={!isReady}
          className="reader__nav"
          aria-label="Next page"
        >
          ›
        </button>
      </footer>
    </div>
  );
}
