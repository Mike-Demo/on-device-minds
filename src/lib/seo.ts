/**
 * Shared identity and structured-data helpers.
 *
 * Every page's JSON-LD references the same publisher and website nodes by
 * `@id` so search engines merge the pages into one site rather than treating
 * each one as an unrelated document.
 */

export const SITE_URL = "https://ai.mikedemo.dev";
export const SITE_NAME = "On-device AI";

export const PUBLISHER_ID = `${SITE_URL}/#publisher`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** Absolute URL for a route path such as `/faq`. */
export const pageUrl = (path: string): string =>
  path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;

export const publisherJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": PUBLISHER_ID,
  name: "MikeDemo",
  url: SITE_URL,
  description:
    "MikeDemo builds open, privacy-first AI experiments for the web — including On-device AI, a web app that runs small language models entirely in the visitor's browser with no server, API key, or account.",
  sameAs: [
    "https://github.com/Mike-Demo",
    "https://www.linkedin.com/in/mikedemopoulos",
    "https://x.com/mike_demo",
    "https://www.threads.com/@mdemop",
  ],
} as const;

export const publisherRef = { "@id": PUBLISHER_ID } as const;
export const websiteRef = { "@id": WEBSITE_ID } as const;

export interface BreadcrumbStep {
  readonly name: string;
  readonly path: string;
}

export const breadcrumbJsonLd = (steps: readonly BreadcrumbStep[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: steps.map((step, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: step.name,
    item: pageUrl(step.path),
  })),
});

export interface ArticleInput {
  readonly headline: string;
  readonly description: string;
  readonly path: string;
  /** ISO date, kept as a literal so a rebuild does not churn the value. */
  readonly datePublished: string;
  readonly dateModified: string;
}

export const articleJsonLd = (article: ArticleInput) => ({
  "@context": "https://schema.org",
  "@type": "Article",
  headline: article.headline,
  description: article.description,
  url: pageUrl(article.path),
  datePublished: article.datePublished,
  dateModified: article.dateModified,
  inLanguage: "en",
  author: { "@type": "Person", name: "MikeDemo" },
  publisher: publisherRef,
  isPartOf: websiteRef,
  mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl(article.path) },
});

export interface WebPageInput {
  readonly name: string;
  readonly description: string;
  readonly path: string;
}

export const webPageJsonLd = (page: WebPageInput) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": pageUrl(page.path),
  name: page.name,
  description: page.description,
  url: pageUrl(page.path),
  inLanguage: "en",
  isPartOf: websiteRef,
  publisher: publisherRef,
});
