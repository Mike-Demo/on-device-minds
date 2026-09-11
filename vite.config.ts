// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Every page renders identically for every visitor (no cookies, session or per-user data),
    // so build them once to static HTML. /sitemap.xml stays a server route.
    pages: [{ path: "/" }, { path: "/neural-engine" }, { path: "/licenses" }],
    prerender: { enabled: true, autoStaticPathsDiscovery: false },
  },
  vite: {
    plugins: [
      VitePWA({
        // Registration happens only through src/lib/pwa.ts, which refuses to run
        // in dev, in an iframe, on Lovable preview hosts, or with ?sw=off.
        injectRegister: null,
        registerType: "autoUpdate",
        filename: "sw.js",
        devOptions: { enabled: false },
        includeAssets: ["favicon.svg", "apple-touch-icon.png", "robots.txt"],
        manifest: {
          name: "On-device AI — a model running in your browser",
          short_name: "On-device AI",
          description:
            "Download a small language model into your browser and chat with it entirely on your own hardware.",
          start_url: "/",
          scope: "/",
          display: "standalone",
          background_color: "#f5f6f8",
          theme_color: "#0071ec",
          icons: [
            { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
            { src: "/pwa-512.png", sizes: "512x512", type: "image/png" },
            {
              src: "/pwa-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
          ],
        },
        workbox: {
          // The inference runtime is fetched on demand and cached by its own layer.
          globIgnores: ["**/*.wasm"],
          navigateFallback: null,
          runtimeCaching: [
            {
              // HTML navigations are always network-first so a deploy is picked up.
              // OAuth callbacks must always hit the network, never a cache.
              urlPattern: ({ request, url }) =>
                request.mode === "navigate" && !url.pathname.startsWith("/~oauth"),
              handler: "NetworkFirst",
              options: {
                cacheName: "pages",
                networkTimeoutSeconds: 5,
                expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 7 },
              },
            },
            {
              // Hashed build assets never change under the same URL.
              urlPattern: ({ url, sameOrigin }) =>
                sameOrigin === true && url.pathname.startsWith("/_build/"),
              handler: "CacheFirst",
              options: {
                cacheName: "assets",
                expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
          ],
        },
      }),
    ],
  },
});
