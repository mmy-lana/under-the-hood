import { error } from '@sveltejs/kit';
import { allTopics, findTopic, topicSummaries } from '$lib/content';
import type { TopicSchema } from '$lib/content/schema';
import { highlight } from '$lib/shiki/highlight';
import type { DiffPaneData } from '$lib/types';

export const prerender = true;

interface TopicRouteParams {
  category: string;
  subcategory: string;
  id: string;
}

/** Enumerate every topic so adapter-static (strict mode) can prerender all of them. */
export function entries(): Array<TopicRouteParams> {
  return allTopics.map((t) => ({
    category: t.category,
    subcategory: t.subcategory,
    id: t.id
  }));
}

const ROSETTA_LANG: Record<string, string> = {
  react: 'tsx',
  angular: 'typescript',
  vue: 'vue',
  svelte: 'svelte',
  fastapi: 'python',
  nestjs: 'typescript',
  spring: 'java',
  springboot: 'java',
  node: 'javascript',
  express: 'javascript',
  bun: 'typescript',
  deno: 'typescript',
  go: 'go',
  rust: 'rust',
  java: 'java',
  python: 'python',
  dotnet: 'csharp',
  csharp: 'csharp',
  cpp: 'cpp',
  ruby: 'ruby',
  html: 'html',
  htmx: 'html',
  css: 'css',
  // Additional keys observed in content JSONs (UI-004).
  browser: 'javascript',
  typescript: 'typescript',
  vite: 'typescript',
  npm: 'bash',
  pnpm: 'bash',
  yarn: 'bash',
  c: 'cpp'
};

export interface TopicPageData {
  topic: TopicSchema;
  /** SEO-002: meta description derived from the senior depth, capped at 160 chars. */
  description: string;
  /** PERF-001: list-view summaries for the root layout sidebar + search index. */
  summaries: TopicSchema[];
  html: {
    legacySnippet: string;
    modernSnippet: string;
    legacyFull: string;
    modernFull: string;
    rosetta: Record<string, string>;
  };
  legacyPane: DiffPaneData;
  modernPane: DiffPaneData;
  prev?: TopicSchema;
  next?: TopicSchema;
}

/**
 * SEO-002: search engines truncate descriptions around 150–160 characters, so
 * derive one from the senior depth's first sentence and hard-cap it at 160.
 */
function metaDescription(text: string): string {
  const sentence = (text.split(/(?<=\.)\s/)[0] ?? text).trim();
  if (sentence.length <= 160) return sentence;
  const cut = sentence.slice(0, 157);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), 0) || 157)}…`;
}

export async function load({
  params
}: {
  params: TopicRouteParams;
}): Promise<TopicPageData> {
  const topic = findTopic(params.category, params.subcategory, params.id);
  if (!topic) {
    throw error(404, `Topic "${params.id}" not found`);
  }

  const legacy = topic.codeComparison.legacyOrBad;
  const modern = topic.codeComparison.modernOrGood;

  const [legacySnippetHtml, modernSnippetHtml, legacyFullHtml, modernFullHtml] =
    await Promise.all([
      highlight(legacy.snippet, legacy.fullFile.language),
      highlight(modern.snippet, modern.fullFile.language),
      highlight(legacy.fullFile.code, legacy.fullFile.language),
      highlight(modern.fullFile.code, modern.fullFile.language)
    ]);

  const rosettaEntries = await Promise.all(
    Object.entries(topic.rosettaStone ?? {}).map(async ([framework, code]) => {
      const lang = ROSETTA_LANG[framework.toLowerCase()] ?? 'text';
      return [framework, await highlight(code, lang)] as const;
    })
  );
  const rosetta: Record<string, string> = Object.fromEntries(
    rosettaEntries
  );

  const index = allTopics.findIndex((t) => t.id === topic.id);
  // PERF-001: prev/next links only render id/title/category/subcategory, so
  // ship summaries instead of full topic bodies.
  const summaries = topicSummaries(allTopics);
  const prev = index > 0 ? summaries[index - 1] : undefined;
  const next = index < summaries.length - 1 ? summaries[index + 1] : undefined;

  return {
    topic,
    description: metaDescription(topic.progressiveExplaining.senior),
    summaries,
    html: {
      legacySnippet: legacySnippetHtml,
      modernSnippet: modernSnippetHtml,
      legacyFull: legacyFullHtml,
      modernFull: modernFullHtml,
      rosetta
    },
    legacyPane: {
      label: legacy.label,
      filename: legacy.fullFile.filename,
      language: legacy.fullFile.language,
      html: legacyFullHtml,
      code: legacy.fullFile.code
    },
    modernPane: {
      label: modern.label,
      filename: modern.fullFile.filename,
      language: modern.fullFile.language,
      html: modernFullHtml,
      code: modern.fullFile.code
    },
    prev,
    next
  };
}