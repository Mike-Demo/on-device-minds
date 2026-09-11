# Structured data review and SEO clean-up

I read every page's metadata and structured data. Nothing is broken, but there are real gaps that
stop Google from connecting the pages into one recognised site.

## What's there today

| Page | Structured data | Canonical / page URL |
| --- | --- | --- |
| Home | WebSite, SoftwareApplication | missing |
| FAQ | FAQPage, breadcrumbs | present, but written as a short path |
| Neural Engine | Article | present, short path; no breadcrumbs |
| Run Llama 3 | Article, breadcrumbs | present, short path |
| Credits | none | missing |

## Issues found

1. **The home page never says which address it is.** It has no canonical link and no page URL,
   so search engines can treat different addresses (with or without a trailing slash, or the
   preview address) as separate copies of the same page.
2. **Page addresses are written as short paths** (`/faq`) rather than the full
   `https://ai.mikedemo.dev/faq`. Some crawlers and every social preview scraper want the full
   address.
3. **The two article pages have no publish or update date** and no named publisher, which are the
   fields Google looks for on article-type pages.
4. **Neural Engine has no breadcrumb trail**, while the other two deep pages do — so it is the one
   deep page that won't show a "Home > ..." path in results.
5. **There is no single site identity.** WebSite, SoftwareApplication and the two Articles each
   describe themselves in isolation; nothing ties them to one publisher, so Google can't merge them
   into one knowledge entry.
6. **The app entry is thin.** It doesn't state that it's free, what browser it needs, or what it
   does — all fields Google supports for software listings.
7. **Credits page has no structured data and no canonical.**
8. **No share image anywhere.** The share tags claim a large image card but no image exists, so
   links posted to social sites render as plain text. Noted, not fixed here — see Not doing.

## Changes I'll make

- Add one shared file describing the site and its publisher, and reference it from every page's
  structured data so they form a single connected graph.
- Home: add canonical and full page address; enrich the app entry with free-to-use, browser
  requirement, feature list, and creator.
- FAQ, Neural Engine, Llama 3, Credits: canonical and page address as full URLs.
- Neural Engine: add a breadcrumb trail matching the other deep pages.
- Both article pages: add published and updated dates plus publisher.
- Credits: add a basic page entry with breadcrumbs.
- No page wording, layout, or styling changes.

## Technical notes

- New `src/lib/seo.ts` exporting `SITE_URL`, `pageUrl()`, a shared `Organization`/`WebSite` `@id`,
  and helpers for breadcrumb and article nodes. Route files stay the only place `head()` is defined.
- Canonical stays leaf-only, self-referencing, absolute. No canonical or page-specific tags move to
  `__root.tsx`.
- Article dates as ISO strings held next to each page's content, not generated at render time
  (a fresh date on every build is a negative signal).
- Verification: production build, then read the prerendered HTML for each route and validate each
  JSON-LD block parses and carries the expected type and URL.

## Not doing

- No share image. The pages have no photo or cover to point at, and a made-up placeholder previews
  worse than none. Happy to generate a proper 1200x630 card if you want one.
- No review, rating, or FAQ entries that aren't already on the page — inventing those risks a manual
  penalty.
