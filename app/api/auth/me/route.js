import { NextResponse } from 'next/server';
import { getSessionFromRequest, getZlibProfile } from '@/app/lib/zlib';

// Returns the signed-in account and its download quota, or { user: null }.
// Quota fields are read defensively because the profile shape is not verified.
export async function GET(request) {
  const session = getSessionFromRequest(request);
  if (!session) return NextResponse.json({ user: null });

  try {
    const { ok, data } = await getZlibProfile(session);
    const user = data?.user ?? data;

    if (!ok || !user || user.id == null) {
      // The stored session is no longer valid, so treat the user as signed out.
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: String(user.id),
        name: user.name ?? '',
        email: user.email ?? '',
        downloadsToday: Number(user.downloads_today ?? user.downloadsToday) || 0,
        downloadsLimit: Number(user.downloads_limit ?? user.downloadsLimit) || 0,
      },
    });
  } catch (error) {
    console.error('Profile lookup failure:', error);
    return NextResponse.json({ error: 'Unable to load the account' }, { status: 502 });
  }
}
