export interface ZlibBookRaw {
  id: number;
  title: string;
  author: string;
  year: string | number;
  extension: string;
  hash: string;
  coverUrl?: string;
  [key: string]: unknown;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  year: number;
  extension: string;
  hash: string;
  coverUrl: string | null;
}

export interface SearchRequestBody {
  query: string;
  language?: string;
  extension?: string;
  yearFrom?: number;
  yearTo?: number;
}

export interface DownloadRequestBody {
  id: number;
  hash: string;
  title: string;
  extension: string;
}
