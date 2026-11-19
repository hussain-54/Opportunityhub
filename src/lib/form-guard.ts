/** Lightweight client-side spam guards (honeypot + cooldown). Not a substitute for server rate limits. */

const DEFAULT_COOLDOWN_MS = 45_000;

export function isHoneypotFilled(value: FormDataEntryValue | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function assertFormCooldown(key: string, cooldownMs = DEFAULT_COOLDOWN_MS): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    const last = raw ? Number(raw) : 0;
    if (last && Date.now() - last < cooldownMs) {
      const seconds = Math.ceil((cooldownMs - (Date.now() - last)) / 1000);
      return `Please wait ${seconds}s before trying again.`;
    }
  } catch {
    // ignore storage errors
  }
  return null;
}

export function markFormSubmitted(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, String(Date.now()));
  } catch {
    // ignore
  }
}

export const FORM_KEYS = {
  newsletter: "fb_nl_last",
  submit: "fb_submit_last",
  unsubscribe: "fb_unsub_last",
} as const;
