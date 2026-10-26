import { allTopics, groupBySubcategory, topicSummaries } from '$lib/content';
import type { TopicSchema } from '$lib/content/schema';

/**
 * PERF-001: the homepage ships list-view summaries only (id/title/category/
 * subcategory/tags/lastUpdated) — full topic bodies stay on topic pages.
 * `summaries` is the shared nav payload the root layout renders the sidebar
 * and search index from (devalue serialises the shared array reference once).
 */
export interface HomeData {
  allTopics: TopicSchema[];
  topicsBySubcategory: Record<string, TopicSchema[]>;
  summaries: TopicSchema[];
}

export function load(): HomeData {
  const summaries = topicSummaries(allTopics);
  return {
    allTopics: summaries,
    topicsBySubcategory: groupBySubcategory(summaries),
    summaries
  };
}
