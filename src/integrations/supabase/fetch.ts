export function isNewSupabaseApiKey(value: string): boolean {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

export function createSupabaseFetch(supabaseKey: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}

function firstEnv(...values: Array<string | undefined | null>): string {
  for (const value of values) {
    const trimmed = typeof value === "string" ? value.trim() : "";
    if (trimmed) return trimmed;
  }
  return "";
}

/** Read Supabase URL/key from Vite build embeds and Nitro/Vercel runtime env. */
export function getSupabaseEnv() {
  const url = firstEnv(
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_URL,
  );

  const anonKey = firstEnv(
    import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    process.env.VITE_SUPABASE_ANON_KEY,
    process.env.SUPABASE_PUBLISHABLE_KEY,
    process.env.SUPABASE_ANON_KEY,
  );

  return { url, anonKey };
}

export function requireSupabaseEnv() {
  const { url, anonKey } = getSupabaseEnv();
  if (!url || !anonKey) {
    const missing = [
      ...(!url
        ? ["NEXT_PUBLIC_SUPABASE_URL (or VITE_SUPABASE_URL / SUPABASE_URL)"]
        : []),
      ...(!anonKey
        ? [
            "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_PUBLISHABLE_KEY)",
          ]
        : []),
    ];
    const message = `Missing Supabase environment variable(s): ${missing.join(", ")}. Add them in the Vercel project Environment Variables, then redeploy. See .env.example.`;
    console.error(`[Supabase] ${message}`);
    throw new Error(message);
  }
  return { url, anonKey };
}
