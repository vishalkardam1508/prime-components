import { DANGEROUS_URL_PROTOCOLS } from '../../editor/constants/editorConstants';

/** Returns true if the URL is safe to use as an href/src. */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const normalized = url.trim().toLowerCase();
  if (DANGEROUS_URL_PROTOCOLS.some((p) => normalized.startsWith(p))) return false;
  return true;
}

/** Normalizes a user-entered URL, adding https:// if no scheme is present. */
export function normalizeUrl(url: string | null | undefined): string {
  const trimmed = (url ?? '').trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed) || trimmed.startsWith('#') || trimmed.startsWith('/')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
