import { NextResponse } from 'next/server';
import { getBookCoverUrl, getZlibConfig } from '@/app/lib/zlib';

export async function POST(request) {
  try {
    const { query, language, extension, yearFrom, yearTo } = await request.json();
    const { baseUrl, headers } = getZlibConfig();

    const payload = new URLSearchParams();
    payload.append('message', typeof query === 'string' ? query.trim() : '');
    payload.append('limit', '20');
    
    if (language) payload.append('languages', language);
    if (extension) payload.append('extensions[]', extension);
    if (yearFrom) payload.append('yearFrom', yearFrom.toString());
    if (yearTo) payload.append('yearTo', yearTo.toString());

    const zlibResponse = await fetch(`${baseUrl}/eapi/book/search`, {
      method: 'POST',
      headers,
      body: payload.toString()
    });

    const responseText = await zlibResponse.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error('Search API returned invalid JSON', {
        status: zlibResponse.status,
        response: responseText.slice(0, 200),
      });
      return NextResponse.json(
        { error: 'Search service returned an invalid response' },
        { status: 502 }
      );
    }

    if (!zlibResponse.ok) {
      console.error('Search API upstream failure', {
        status: zlibResponse.status,
        error: data.error,
      });
      return NextResponse.json(
        { error: data.error || 'Search service request failed' },
        { status: 502 }
      );
    }

    if (data.books) {
      data.books = data.books.map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        year: book.year,
        extension: book.extension,
        hash: book.hash,
        // Generates full fallback routing if no primary cover path exists
        coverUrl: getBookCoverUrl(baseUrl, book.cover || book.coverUrl)
      }));
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Search API Failure:", error);
    return NextResponse.json(
      { error: "Unable to reach the Z-Library search service" },
      { status: 502 }
    );
  }
}
