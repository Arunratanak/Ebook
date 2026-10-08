// Formats that foliate-js can render in the browser (see public/foliate-js).
// Keep lowercase; comparisons below normalize the input.
export const READABLE_EXTENSIONS: readonly string[] = [
  'epub',
  'mobi',
  'azw3',
  'fb2',
  'cbz',
  'pdf',
];

export function isReadableExtension(extension: string | null | undefined): boolean {
  return READABLE_EXTENSIONS.includes((extension ?? '').trim().toLowerCase());
}
