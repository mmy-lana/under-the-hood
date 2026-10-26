import { allTopics } from '$lib/content';

/**
 * SEO-001: prerendered XML sitemap covering every route (home + all topics).
 * adapter-static writes this endpoint to `build/sitemap.xml` at build time.
 */
export const prerender = true;

const BASE = 'https://underthehood.mmylana.my.id';

export function GET(): Response {
  const urls = [
    `${BASE}/`,
    ...allTopics.map((t) => `${BASE}/${t.category}/${t.subcategory}/${t.id}/`)
  ];
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((loc) => `  <url>\n    <loc>${loc}</loc>\n  </url>`),
    '</urlset>',
    ''
  ].join('\n');
  return new Response(body, {
    headers: { 'content-type': 'application/xml; charset=utf-8' }
  });
}
