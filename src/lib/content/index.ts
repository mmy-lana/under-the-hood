import type { TopicSchema } from './schema';
import { assertValidTopic } from './validate';

/**
 * Content ingestion for the topic JSON files (PERF-001 split).
 *
 * This module serves two very different consumers:
 *
 * 1. CLIENT chrome (HeaderNav's framework <select>) needs only the list of
 *    subcategory *names*. It reads `topicsBySubcategory` keys, so that record
 *    is derived from glob PATHS only — no content JSON enters the client
 *    bundle through it.
 *
 * 2. SERVER code (route +page.server.ts load functions, run during prerender)
 *    needs the full topics. They come from `allTopics` & friends, which are
 *    built lazily inside `/* @__PURE__ *\/`-annotated initializers so that any
 *    client chunk that does not reference them drops both the builder calls
 *    (including the `assertValidTopic` validation) and the eagerly imported
 *    JSON modules entirely.
 *
 * Every module still passes through assertValidTopic, so invalid content fails
 * `pnpm build` immediately with the offending file path.
 */

type GlobModules = Record<string, unknown>;

/* ------------------------------------------------------------------ */
/* Client-safe path index (no content JSON)                            */
/* ------------------------------------------------------------------ */

// Lazy glob: only the path keys are consumed, so no JSON is materialised.
const contentPaths = Object.keys(import.meta.glob('/content/**/*.json'));

function subcategoryFromPath(path: string): string {
  // "/content/<category>/<subcategory>/<id>.json" -> "<subcategory>"
  return path.split('/')[3] ?? '';
}

/**
 * Subcategory index for the client-side framework filter (HeaderNav reads the
 * keys only). Values intentionally stay empty — real grouping for server
 * consumers is provided by `groupBySubcategory` below.
 */
export const topicsBySubcategory: Record<string, TopicSchema[]> = (() => {
  const acc: Record<string, TopicSchema[]> = {};
  for (const path of contentPaths) {
    const name = subcategoryFromPath(path);
    if (name && !(name in acc)) acc[name] = [];
  }
  return acc;
})();

/* ------------------------------------------------------------------ */
/* Full topic data (build-time / server-only)                          */
/* ------------------------------------------------------------------ */

// With `import: 'default'` each glob module value IS the parsed JSON
// object (not `{ default: obj }`), so the module is validated directly.
const modules: GlobModules = import.meta.glob('/content/**/*.json', {
  eager: true,
  import: 'default'
}) as GlobModules;

function loadAllTopics(): TopicSchema[] {
  const rawTopics: TopicSchema[] = [];
  for (const [path, module] of Object.entries(modules)) {
    assertValidTopic(module, path);
    rawTopics.push(module as TopicSchema);
  }
  return [...rawTopics].sort(compareTopics);
}

function compareTopics(a: TopicSchema, b: TopicSchema): number {
  const byDate = b.lastUpdated.localeCompare(a.lastUpdated);
  if (byDate !== 0) return byDate;
  return a.title.localeCompare(b.title);
}

export const allTopics: TopicSchema[] = /* @__PURE__ */ loadAllTopics();

/** Real subcategory grouping (values included) — server consumers only. */
export function groupBySubcategory(topics: TopicSchema[]): Record<string, TopicSchema[]> {
  return topics.reduce<Record<string, TopicSchema[]>>((acc, topic) => {
    const list = acc[topic.subcategory] ?? [];
    list.push(topic);
    acc[topic.subcategory] = list;
    return acc;
  }, {});
}

/**
 * List-view projection (PERF-001): the layout sidebar, homepage grid, and
 * search palette only need id/title/category/subcategory/tags/lastUpdated.
 * Full topic bodies stay on the topic pages' own data.
 *
 * The result is widened to `TopicSchema[]` at this single boundary because
 * consumer prop/data signatures (SidebarToC, HomeData) still ask for
 * `TopicSchema[]`; only the summary fields listed above are populated.
 */
export function topicSummaries(topics: TopicSchema[]): TopicSchema[] {
  return topics.map((topic) =>
    ({
      id: topic.id,
      title: topic.title,
      category: topic.category,
      subcategory: topic.subcategory,
      lastUpdated: topic.lastUpdated,
      tags: topic.tags
    }) as TopicSchema
  );
}

export function findTopic(
  category: string,
  subcategory: string,
  id: string
): TopicSchema | undefined {
  return allTopics.find(
    (topic) =>
      topic.category === category && topic.subcategory === subcategory && topic.id === id
  );
}
