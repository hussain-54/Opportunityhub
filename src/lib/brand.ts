/** Public-facing brand — keep internal DB/API identifiers unchanged. */
export const BRAND_NAME = "FutureBridge";
export const BRAND_NAME_DISPLAY = "FutureBridge";
export const BRAND_TAGLINE = "Bridging Ambition with Global Opportunities.";
export const BRAND_TAGLINE_ALT = "Discover Opportunities. Build Your Future.";
export const BRAND_JOURNAL = "FutureBridge Journal";
export const BRAND_EDITORS = "FutureBridge Editors";
export const BRAND_COPYRIGHT = "FutureBridge";
export const BRAND_SITE_DESCRIPTION =
  "Discover scholarships, fellowships, grants, accelerators, internships, and research programs worldwide.";

export function pageTitle(segment?: string) {
  return segment ? `${segment} — ${BRAND_NAME}` : `${BRAND_NAME} — ${BRAND_SITE_DESCRIPTION}`;
}

/** Short default title for browser tabs when description is too long. */
export function defaultTitle() {
  return `${BRAND_NAME} — Discover Opportunities. Build Your Future.`;
}