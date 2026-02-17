export function sanitizeCallbackUrl(raw: string | null): string {
  const fallback = '/dashboard'
  if (!raw) return fallback
  return raw.startsWith('/') && !raw.startsWith('//') ? raw : fallback
}
