import { NextResponse } from 'next/server';
import { getZlibConfig } from '@/app/lib/zlib';

export async function POST(request) {
  try {
    const { id, hash, title, extension } = await request.json();
    const { baseUrl, headers } = getZlibConfig();

    const linkResponse = await fetch(
      `${baseUrl}/eapi/book/${encodeURIComponent(id)}/${encodeURIComponent(hash)}/file`,
      { headers }
    );

    const linkData = await linkResponse.json();
    if (!linkResponse.ok) {
      return NextResponse.json(
        { error: linkData.error || 'Could not retrieve download link' },
        { status: 502 }
      );
    }
    if (!linkData.file || !linkData.file.downloadLink) {
      return NextResponse.json({ error: "Could not retrieve download link" }, { status: 400 });
    }

    const fileStreamResponse = await fetch(linkData.file.downloadLink, {
      headers: {
        ...headers,
        authority: new URL(linkData.file.downloadLink).host,
      }
    });

    if (!fileStreamResponse.ok) {
      return NextResponse.json(
        { error: 'Could not download the book file' },
        { status: 502 }
      );
    }

    const fileBuffer = await fileStreamResponse.arrayBuffer();
    const cleanFileName = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${extension}`;

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        // Instructs the user's browser to cleanly save the file with the correct extension
        'Content-Disposition': `attachment; filename="${cleanFileName}"`,
      },
    });
  } catch (error) {
    console.error("Download Extraction Failure:", error);
    return NextResponse.json({ error: "Download could not complete" }, { status: 500 });
  }
}
