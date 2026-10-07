const DEFAULT_BASE_URL = 'https://z-library.biz';

export function getZlibConfig() {
  const userId = process.env.ZLIB_USER_ID;
  const userKey = process.env.ZLIB_USER_KEY;

  if (!userId || !userKey) {
    throw new Error('ZLIB_USER_ID and ZLIB_USER_KEY are required');
  }

  return {
    baseUrl: (process.env.ZLIB_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, ''),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'accept-language': 'en-US,en;q=0.9',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
      cookie: `siteLanguageV2=en; remix_userid=${encodeURIComponent(userId)}; remix_userkey=${encodeURIComponent(userKey)}`,
    },
  };
}

export function getBookCoverUrl(baseUrl, cover) {
  if (!cover) return null;
  return cover.startsWith('http') ? cover : `${baseUrl}${cover}`;
}
