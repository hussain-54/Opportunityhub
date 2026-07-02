import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportAppError } from "../lib/error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <span className="eyebrow text-orange">404</span>
        <h1 className="mt-4 font-serif text-5xl font-bold text-navy">Page not found</h1>
        <p className="mt-3 text-sm text-ink-muted">
          The opportunity you're looking for may have closed or moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center bg-navy px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-widest text-white hover:bg-orange transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportAppError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl font-bold text-navy">This page didn't load</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="bg-navy px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-widest text-white hover:bg-orange transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="border border-navy/20 bg-paper px-5 py-2.5 text-xs font-mono font-bold uppercase tracking-widest text-navy hover:border-navy transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OpportunityHub — Scholarships, Fellowships, Grants & Startup Opportunities" },
      {
        name: "description",
        content:
          "Discover scholarships, fellowships, grants, accelerators, conferences, hackathons, and funding opportunities for students, entrepreneurs, and researchers worldwide.",
      },
      { name: "author", content: "OpportunityHub" },
      { property: "og:site_name", content: "OpportunityHub" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@OpportunityHub" },
      { name: "theme-color", content: "#0b1633" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&family=Playfair+Display:ital,wght@0,500;0,700;0,900;1,700;1,900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "OpportunityHub",
          url: "/",
          description:
            "Global discovery platform for scholarships, fellowships, grants, accelerators, and funding opportunities.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
