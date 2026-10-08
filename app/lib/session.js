import { SESSION_KEY_COOKIE, SESSION_UID_COOKIE } from '@/app/lib/zlib';

const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

// Pulls the account fields out of an EAPI response. The shape is not verified
// against a live account, so every field is read defensively.
export function extractAccount(data) {
  const user = data?.user ?? data;
  const id = user?.id ?? null;
  const userKey = user?.remix_userkey ?? null;
  if (id == null || !userKey) return null;
  return {
    id: String(id),
    userKey: String(userKey),
    name: user?.name ?? '',
    email: user?.email ?? '',
  };
}

export function setSessionCookies(response, account) {
  const options = {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  };
  response.cookies.set(SESSION_UID_COOKIE, account.id, options);
  response.cookies.set(SESSION_KEY_COOKIE, account.userKey, options);
  return response;
}

export function clearSessionCookies(response) {
  for (const name of [SESSION_UID_COOKIE, SESSION_KEY_COOKIE]) {
    response.cookies.set(name, '', { path: '/', maxAge: 0 });
  }
  return response;
}

