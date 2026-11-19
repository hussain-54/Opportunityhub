/** Absolute site origin for canonicals, sitemap, and Open Graph. */
export function getSiteUrl(): string {
  const fromEnv =
    (typeof import.meta !== "undefined" &&
      (import.meta.env.VITE_SITE_URL || import.meta.env.NEXT_PUBLIC_SITE_URL)) ||
    process.env.VITE_SITE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "";

  const cleaned = String(fromEnv).trim().replace(/\/$/, "");
  if (cleaned) return cleaned;

  // Keep relative-safe fallback for local / unknown deploy hosts
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }

  return "";
}

export function absoluteUrl(path = "/"): string {
  const base = getSiteUrl();
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${normalized}` : normalized;
}
