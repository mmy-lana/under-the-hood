<script lang="ts">
  import { onMount } from 'svelte';
  import { ChevronLeft, ChevronRight, ChevronRight as Crumb, Clock, ListChecks } from '@lucide/svelte';
  import Badge from '$lib/components/atoms/Badge.svelte';
  import DepthPill from '$lib/components/atoms/DepthPill.svelte';
  import InterviewGotchaCard from '$lib/components/molecules/InterviewGotchaCard.svelte';
  import RosettaTabs from '$lib/components/molecules/RosettaTabs.svelte';
  import SnippetDiffPreview from '$lib/components/molecules/SnippetDiffPreview.svelte';
  import FullDiffModal from '$lib/components/organisms/FullDiffModal.svelte';
  import ProgressiveReader from '$lib/components/organisms/ProgressiveReader.svelte';
  import { getDepth, setDepth, initDepthFromUrl, DEPTH_TIERS } from '$lib/stores/depth.svelte';
  import type { HighlightedCode } from '$lib/types';
  import type { TopicPageData } from './+page.server';

  let { data }: { data: TopicPageData } = $props();

  let diffOpen = $state(false);

  const topic = $derived(data.topic);

  const rosetta = $derived(
    Object.fromEntries(
      Object.entries(data.html.rosetta).map(([fw, html]) => {
        const code = data.topic.rosettaStone?.[fw] ?? '';
        return [fw, { html, code }] as const;
      })
    ) as Record<string, HighlightedCode>
  );

  const snippetLegacy = $derived({
    ...data.legacyPane,
    html: data.html.legacySnippet,
    code: data.topic.codeComparison.legacyOrBad.snippet
  });

  const snippetModern = $derived({
    ...data.modernPane,
    html: data.html.modernSnippet,
    code: data.topic.codeComparison.modernOrGood.snippet
  });

  function formatDate(value: string): string {
    const [year, month, day] = value.split('-').map((p) => Number(p));
    if (!year || !month || !day) return value;
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(year, month - 1, day));
  }

  onMount(() => {
    initDepthFromUrl();
  });
</script>

<svelte:head>
  <title>{topic.title} — Under The Hood</title>
  <!-- SEO-002: capped at 160 chars (server-derived first sentence). -->
  <meta name="description" content={data.description} />
</svelte:head>

<article>
  <!-- Breadcrumb -->
  <nav class="mb-4 flex flex-wrap items-center gap-1 text-xs text-text-muted" aria-label="Breadcrumb">
    <a href="/" class="min-h-11 inline-flex items-center rounded px-1 transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none">
      Home
    </a>
    <Crumb class="h-3 w-3" aria-hidden="true" />
    <a
      href={`/#${topic.category}`}
      class="min-h-11 inline-flex items-center rounded px-1 transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
    >
      {topic.category}
    </a>
    <Crumb class="h-3 w-3" aria-hidden="true" />
    <span class="font-mono" translate="no">{topic.subcategory}</span>
  </nav>

  <!-- Title + meta -->
  <header class="mb-6">
    <div class="flex flex-wrap items-center gap-2">
      <Badge label={topic.category} tone="accent" />
      <Badge label={topic.subcategory} tone="neutral" />
      {#if topic.versionContext}
        <Badge label={topic.versionContext} tone="neutral" />
      {/if}
    </div>
    <h1 class="mt-3 text-balance text-2xl font-bold tracking-tight text-text sm:text-3xl">
      {topic.title}
    </h1>

    <dl class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
      <div class="flex items-center gap-1.5">
        <dt class="sr-only">Last updated</dt>
        <Clock class="h-3.5 w-3.5" aria-hidden="true" />
        <dd><time datetime={topic.lastUpdated}>{formatDate(topic.lastUpdated)}</time></dd>
      </div>
      <div class="flex flex-wrap items-center gap-1.5">
        <dt class="flex items-center gap-1.5">
          <ListChecks class="h-3.5 w-3.5" aria-hidden="true" />
          <span class="sr-only">Prerequisites:</span>
        </dt>
        {#each topic.prerequisites as prereq (prereq)}
          <dd class="rounded-full border border-border bg-surface px-2 py-0.5">{prereq}</dd>
        {/each}
      </div>
    </dl>

    <ul class="mt-3 flex flex-wrap gap-1.5">
      {#each topic.tags as tag (tag)}
        <li><Badge label={tag} tone="neutral" /></li>
      {/each}
    </ul>
  </header>

  <!-- Depth stepper + reader -->
  <section class="mb-8" aria-labelledby="reader-heading">
    <h2 id="reader-heading" class="sr-only">Read at your depth</h2>
    <div class="mb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" role="group" aria-label="Reading depth">
      {#each DEPTH_TIERS as tier (tier)}
        <DepthPill tier={tier} active={getDepth() === tier} onselect={setDepth} />
      {/each}
    </div>
    <ProgressiveReader depths={topic.progressiveExplaining} active={getDepth()} />
  </section>

  <!-- Rosetta stone -->
  {#if Object.keys(rosetta).length > 0}
    <section class="mb-8" aria-labelledby="rosetta-heading">
      <h2 id="rosetta-heading" class="mb-3 text-lg font-semibold text-text">
        The same idea in other frameworks
      </h2>
      <RosettaTabs rosetta={rosetta} />
    </section>
  {/if}

  <!-- Code comparison -->
  <section class="mb-8" aria-labelledby="diff-heading">
    <h2 id="diff-heading" class="mb-1 text-lg font-semibold text-text">
      Legacy vs modern
    </h2>
    <SnippetDiffPreview
      title={topic.codeComparison.title}
      summary={topic.codeComparison.summary}
      legacy={snippetLegacy}
      modern={snippetModern}
      onexpand={() => (diffOpen = true)}
    />
  </section>

  <!-- Interview gotchas -->
  <section class="mb-8 space-y-4" aria-labelledby="gotchas-heading">
    <h2 id="gotchas-heading" class="text-lg font-semibold text-text">
      Interview gotchas
    </h2>
    {#each topic.interviewGotchas as gotcha, i (i)}
      <InterviewGotchaCard gotcha={gotcha} index={i} defaultOpen={i === 0} />
    {/each}
  </section>

  <!-- Prev / next -->
  <nav class="grid grid-cols-1 gap-3 border-t border-border pt-6 sm:grid-cols-2" aria-label="Topic navigation">
    {#if data.prev}
      <a
        href={`/${data.prev.category}/${data.prev.subcategory}/${data.prev.id}/`}
        class="group flex min-h-11 items-center gap-2 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        data-sveltekit-preload-data="hover"
      >
        <ChevronLeft class="h-5 w-5 shrink-0 text-text-muted group-hover:text-accent" aria-hidden="true" />
        <span class="min-w-0">
          <span class="block text-xs text-text-muted">Previous</span>
          <span class="block truncate text-sm font-medium text-text">{data.prev.title}</span>
        </span>
      </a>
    {/if}
    {#if data.next}
      <a
        href={`/${data.next.category}/${data.next.subcategory}/${data.next.id}/`}
        class="group flex min-h-11 items-center justify-end gap-2 rounded-xl border border-border bg-surface p-3 text-right transition-colors hover:border-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none sm:col-start-2"
        data-sveltekit-preload-data="hover"
      >
        <span class="min-w-0">
          <span class="block text-xs text-text-muted">Next</span>
          <span class="block truncate text-sm font-medium text-text">{data.next.title}</span>
        </span>
        <ChevronRight class="h-5 w-5 shrink-0 text-text-muted group-hover:text-accent" aria-hidden="true" />
      </a>
    {/if}
  </nav>
</article>

<FullDiffModal
  open={diffOpen}
  onclose={() => (diffOpen = false)}
  legacy={data.legacyPane}
  modern={data.modernPane}
/>