# Folio

Folio is a dark, cinematic ebook browser and reader built with Next.js 16 and
React 19. The goal is a local-first app: no account, data stays in the browser.
It's planned as a PWA later.

## Progress

Build order from the plan: Scaffold → Home → Search → Detail → Reader MVP →
Progress/settings → Highlights/definitions → Library/upload → Stats → PWA/polish.

| Stage | Status | Notes |
|---|---|---|
| Scaffold | Done | Next.js 16.4.0, React 19.3.0, TypeScript, ESLint. |
| Home | Partial | Hero shows five hardcoded Jane Austen slides, not a blurred-cover backdrop. Genre shelves are hardcoded, and their covers come from per-title searches. |
| Search | Partial | Search runs on submit, not as you type. Format filter (All, EPUB, PDF, MOBI) is in place. Language, topic, and era filters are not in the UI, and query state is not in the URL. |
| Detail | Partial | Book detail modal opens from each result: title, author, year, format, synopsis, Save, Download, and a "More by author" row. Read is disabled. No dedicated detail route yet. |
| Reader | Partial | `/read` opens EPUB, MOBI/AZW3, FB2, CBZ, and PDF with foliate-js (vendored in `public/foliate-js`). Detail modal's Read button links here. Downloads the file each time it opens. Progress is not saved yet, and only the slider and prev/next controls exist. Not tested against a real book. |
| Progress/settings | Not started | |
| Highlights/definitions | Not started | |
| Library/upload | Not started | |
| Stats | Not started | |
| PWA/polish | Not started | |

### Routes

| Route | Purpose |
|---|---|
| `/` | Home: hero and genre shelves |
| `/search` | Z-Library search, results grid, detail modal |
| `/read` | Reader: opens a book from `id`, `hash`, `title`, `extension` query params |
| `POST /api/search` | Proxies Z-Library search |
| `POST /api/book` | Proxies Z-Library book details (synopsis) |
| `POST /api/download` | Proxies book file download |

### Storage

- **Saved books:** kept in `localStorage` under `folio:saved-books`. This is a
  stopgap. The plan calls for IndexedDB.
- **Settings and reading progress:** not implemented yet.

### Known issues

- **Download route forwards credentials.** `/api/download` sends the Z-Library
  cookies to the download link's host, not only the Z-Library host. It also sets
  an `authority` header, which fetch ignores. Both need fixing before the app is
  shared.
- **Synopsis field is unverified.** `/api/book` reads `description` from the
  EAPI response, but the response shape hasn't been checked against a live book.
- **Other works uses a second search.** Each modal open runs an author search,
  which uses Z-Library quota.
- **Dark Reader hydration warning.** The cover elements have
  `suppressHydrationWarning` because the Dark Reader extension rewrites their
  inline styles before hydration. Disable the extension on localhost to see a
  clean console.
- **Downloads are buffered in memory.** `/api/download` loads the whole file
  before sending it, which is risky for large PDFs.

## Z-Library search configuration

The search API reads `ZLIB_USER_ID` and `ZLIB_USER_KEY` from the project-root
`.env.local` file. Do not put this file under `app/api`, and do not expose these
values to the browser.

```env
ZLIB_USER_ID="your-user-id"
ZLIB_USER_KEY="your-user-key"
ZLIB_BASE_URL="https://z-library.biz"
```

`ZLIB_BASE_URL` must point to a domain that exposes the Z-Library EAPI
endpoints used by the Python client.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
