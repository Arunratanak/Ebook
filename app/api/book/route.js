import { NextResponse } from 'next/server';
import { getBookCoverUrl, getZlibConfig } from '@/app/lib/zlib';

function toPlainText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

export async function POST(request) {
  try {
    const { id, hash } = await request.json();

    if (!id || typeof hash !== 'string' || !hash.trim()) {
      return NextResponse.json({ error: 'Book id and hash are required' }, { status: 400 });
    }

    const { baseUrl, headers } = getZlibConfig();

    const response = await fetch(
      `${baseUrl}/eapi/book/${encodeURIComponent(id)}/${encodeURIComponent(hash)}`,
      { headers }
    );

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Book details API returned invalid JSON', {
        status: response.status,
        response: responseText.slice(0, 200),
      });
      return NextResponse.json(
        { error: 'Book details service returned an invalid response' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error('Book details API upstream failure', {
        status: response.status,
        error: data.error,
      });
      return NextResponse.json(
        { error: data.error || 'Could not load book details' },
        { status: 502 }
      );
    }

    // The EAPI may wrap the record in `book`; fall back to the top-level object.
    const info = data.book ?? data;

    return NextResponse.json({
      book: {
        id: info.id ?? id,
        hash: info.hash ?? hash,
        title: info.title ?? '',
        author: info.author ?? '',
        year: Number(info.year) || 0,
        extension: info.extension ?? '',
        coverUrl: getBookCoverUrl(baseUrl, info.cover || info.coverUrl),
        description:
          typeof info.description === 'string' && info.description.trim()
            ? toPlainText(info.description)
            : null,
      },
    });
  } catch (error) {
    console.error('Book Details Failure:', error);
    return NextResponse.json(
      { error: 'Unable to load book details' },
      { status: 502 }
    );
  }
}
