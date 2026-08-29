import type { TopicCategory, TopicSchema } from './schema';
import { assertValidTopic } from './validate';
import type { SearchRecord } from '$lib/types';

/**
 * Build-time ingestion of the 30 topic JSON files. `import.meta.glob` with
 * `eager: true` resolves at build time — no runtime filesystem access.
 * Every module passes through assertValidTopic, so invalid content fails
 * `pnpm build` immediately with the offending file path.
 */

type GlobModules = Record<string, { default: unknown }>;

const modules: GlobModules = import.meta.glob('/content/**/*.json', {
  eager: true,
  import: 'default'
}) as GlobModules;

const rawTopics: TopicSchema[] = [];

for (const [path, module] of Object.entries(modules)) {
  const raw = module as { default: unknown };
  assertValidTopic(raw.default, path);
  rawTopics.push(raw.default as TopicSchema);
}

function compareTopics(a: TopicSchema, b: TopicSchema): number {
  const byDate = b.lastUpdated.localeCompare(a.lastUpdated);
  if (byDate !== 0) return byDate;
  return a.title.localeCompare(b.title);
}

export const allTopics: TopicSchema[] = [...rawTopics].sort(compareTopics);

export const topicsByCategory: Record<TopicCategory, TopicSchema[]> = {
  frontend: allTopics.filter((t) => t.category === 'frontend'),
  backend: allTopics.filter((t) => t.category === 'backend')
};

export const topicsBySubcategory: Record<string, TopicSchema[]> = allTopics.reduce<
  Record<string, TopicSchema[]>
>((acc, topic) => {
  const list = acc[topic.subcategory] ?? [];
  list.push(topic);
  acc[topic.subcategory] = list;
  return acc;
}, {});

export const subcategories: Array<{ name: string; category: TopicCategory }> =
  Object.keys(topicsBySubcategory)
    .sort()
    .map((name) => {
      const first = topicsBySubcategory[name]?.[0];
      return {
        name,
        category: first?.category ?? 'frontend'
      };
    });

export const searchIndex: SearchRecord[] = allTopics.map((topic) => ({
  id: topic.id,
  title: topic.title,
  category: topic.category,
  subcategory: topic.subcategory,
  tags: topic.tags,
  frameworks: topic.rosettaStone ? Object.keys(topic.rosettaStone) : [],
  href: `/${topic.category}/${topic.subcategory}/${topic.id}/`
}));

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

/** Ordered prev/next walk for topic-page navigation. */
export function getAdjacentTopic(topic: TopicSchema, direction: 'prev' | 'next'): TopicSchema | undefined {
  const index = allTopics.findIndex((t) => t.id === topic.id);
  if (index === -1) return undefined;
  const target = direction === 'prev' ? index - 1 : index + 1;
  return allTopics[target];
}