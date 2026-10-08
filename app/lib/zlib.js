const DEFAULT_BASE_URL = 'https://z-library.biz';

// Cookie names for the signed-in user's Z-Library session. They are HttpOnly,
// so client scripts never read them.
export const SESSION_UID_COOKIE = 'folio_uid';
export const SESSION_KEY_COOKIE = 'folio_ukey';

function getBaseUrl() {
  return (process.env.ZLIB_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

function buildHeaders(cookie) {
  return {
    'Content-Type': 'application/x-www-form-urlencoded',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    cookie,
  };
}

// Reads the signed-in user's session cookies from an incoming request.
// Returns null when the user is not signed in.
export function getSessionFromRequest(request) {
  const header = request?.headers?.get?.('cookie') ?? '';
  const read = name => {
    const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
  };
  const userId = read(SESSION_UID_COOKIE);
  const userKey = read(SESSION_KEY_COOKIE);
  return userId && userKey ? { userId, userKey } : null;
}

function sessionCookie({ userId, userKey }) {
  return `siteLanguageV2=en; remix_userid=${encodeURIComponent(userId)}; remix_userkey=${encodeURIComponent(userKey)}`;
}

// Uses the signed-in user's Z-Library session when present, so downloads count
// against their own quota. Otherwise it falls back to the shared .env.local keys.
export function getZlibConfig(request) {
  const session = getSessionFromRequest(request);
  if (session) {
    return { baseUrl: getBaseUrl(), headers: buildHeaders(sessionCookie(session)) };
  }

  const userId = process.env.ZLIB_USER_ID;
  const userKey = process.env.ZLIB_USER_KEY;

  if (!userId || !userKey) {
    throw new Error('ZLIB_USER_ID and ZLIB_USER_KEY are required');
  }

  return { baseUrl: getBaseUrl(), headers: buildHeaders(sessionCookie({ userId, userKey })) };
}

// Calls a Z-Library EAPI endpoint with a form body and no session cookies.
// Used for login and registration, which create the session.
export async function postZlibForm(path, fields) {
  const body = new URLSearchParams(fields);
  const response = await fetch(`${getBaseUrl()}${path}`, {
    method: 'POST',
    headers: buildHeaders('siteLanguageV2=en'),
    body: body.toString(),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  return { ok: response.ok, status: response.status, data };
}

// Fetches the profile for a session, which includes download quota fields.
export async function getZlibProfile(session) {
  const response = await fetch(`${getBaseUrl()}/eapi/user/profile`, {
    headers: buildHeaders(sessionCookie(session)),
  });
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = null;
  }
  return { ok: response.ok, status: response.status, data };
}

export function getBookCoverUrl(baseUrl, cover) {
  if (!cover) return null;
  return cover.startsWith('http') ? cover : `${baseUrl}${cover}`;
}
