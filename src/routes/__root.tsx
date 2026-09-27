import {
  Outlet,
  Link,
  createRootRoute,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import themeCss from "../design-system/font-awsome-web-awesome-171158/webawesome/theme.css?url";
import { WEB_AWESOME_HTML_CLASSES } from "../design-system/font-awsome-web-awesome-171158/webawesome/setup";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { registerServiceWorker } from "../lib/pwa";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "author", content: "MikeDemo" },
      // Content Security Policy. Third-party inventory (verified 2026-09-26
      // against repo source, the live <head>, and the production JS bundle):
      // - cdn.jsdelivr.net: Web Awesome stylesheet preconnect; <wa-icon>
      //   fetches Font Awesome SVGs from /npm/@fortawesome/fontawesome-free@*/svgs/
      // - js.hcaptcha.com + *.hcaptcha.com: human-check widget (the head
      //   preconnects these hosts; the widget script is not loaded yet)
      // - huggingface.co + *.hf.co: model weight downloads (redirect to
      //   cdn-lfs-*.hf.co at runtime)
      // - app.aikido.dev: security-audit badge image on /licenses/
      // - worker-src blob:: the WebLLM engine worker
      // Trade-off: 'unsafe-inline' on scripts/styles is required because
      // TanStack Start SSR injects inline bootstrap scripts and the app ships
      // an inline preferences bootstrap. Removing it would need nonces or
      // hashes — a bigger change. The policy still blocks off-host script
      // injection, object embeds, and framing by other origins.
      // Deliberately omitted: *.supabase.co — zero references anywhere in the
      // repo, the live <head>, or the production bundle.
      {
        "http-equiv": "Content-Security-Policy",
        content:
          "default-src 'self'; " +
          "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://js.hcaptcha.com; " +
          "style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; " +
          "img-src 'self' data: blob: https://*.hcaptcha.com https://app.aikido.dev; " +
          "font-src 'self' data: https://cdn.jsdelivr.net; " +
          "connect-src 'self' https://cdn.jsdelivr.net https://huggingface.co https://*.hf.co https://hcaptcha.com https://*.hcaptcha.com; " +
          "frame-src https://*.hcaptcha.com; " +
          "worker-src 'self' blob:; " +
          "object-src 'none'; " +
          "base-uri 'self'; " +
          "form-action 'self'",
      },
      // Browser/OS chrome colour: the manifest and this tag only accept literal
      // colours, so it mirrors the brand blue used by the app icon.
      { name: "theme-color", content: "#0071ec" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "On-device AI" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        name: "google-site-verification",
        content: "RHlwBdxnagu8yjEC1UQ3cV-WcIJ17lGECi8uJYHO6P4",
      },
    ],
    links: [
      // Warm the CDN connection before the stylesheet and icon SVG requests.
      { rel: "preconnect", href: "https://cdn.jsdelivr.net", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://cdn.jsdelivr.net" },
      // The human check and the model download both go to other hosts; open
      // those connections while the page is still rendering.
      { rel: "preconnect", href: "https://newassets.hcaptcha.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://hcaptcha.com" },
      { rel: "preconnect", href: "https://huggingface.co", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://cdn-lfs-us-1.hf.co" },
      // Self-hosted copy of the pinned Web Awesome stylesheet (all @imports
      // inlined), so the first paint never waits on a third-party connection.
      { rel: "stylesheet", href: "/vendor/webawesome-3.12.0.css" },
      {
        rel: "stylesheet",
        href: appCss,
      },
      // Design system tokens load last so their values take precedence.
      { rel: "stylesheet", href: themeCss },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={WEB_AWESOME_HTML_CLASSES}>
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
  // Offline support: guarded so it only ever runs on the published site.
  useEffect(() => registerServiceWorker(), []);

  // Required: nested routes render here. Removing <Outlet /> breaks all child routes.
  return <Outlet />;
}
