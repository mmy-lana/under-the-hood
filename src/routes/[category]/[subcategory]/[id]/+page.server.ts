import { error } from '@sveltejs/kit';
import { allTopics, findTopic } from '$lib/content';
import type { TopicSchema } from '$lib/content/schema';
import { highlight } from '$lib/shiki/highlight';
import type { DiffPaneData } from '$lib/types';

export const prerender = true;

interface TopicRouteParams {
  category: string;
  subcategory: string;
  id: string;
}

/** Enumerate every topic so adapter-static (strict mode) can prerender all 30. */
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
  css: 'css'
};

export interface TopicPageData {
  topic: TopicSchema;
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
      const lang = ROSETTA_LANG[framework.toLowerCase()] ?? 'typescript';
      return [framework, await highlight(code, lang)] as const;
    })
  );
  const rosetta: Record<string, string> = Object.fromEntries(
    rosettaEntries
  );

  const index = allTopics.findIndex((t) => t.id === topic.id);
  const prev = index > 0 ? allTopics[index - 1] : undefined;
  const next = index < allTopics.length - 1 ? allTopics[index + 1] : undefined;

  return {
    topic,
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