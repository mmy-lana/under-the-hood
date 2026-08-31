<script lang="ts">
  import { getContext } from 'svelte';
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { ArrowRight, CalendarClock, ChevronDown, ChevronRight, Layers, Tag } from '@lucide/svelte';
  import Badge from '$lib/components/atoms/Badge.svelte';
  import Button from '$lib/components/atoms/Button.svelte';
  import SearchBar from '$lib/components/molecules/SearchBar.svelte';
  import { cn } from '$lib/utils/cn';
  import type { TopicSchema } from '$lib/content/schema';
  import type { HomeData } from './+page.server';

  /** Provided by the root layout — opens the global search palette. */
  const openSearch = getContext<() => void>('uth:search-open');

  let { data }: { data: HomeData } = $props();

  const categoryOrder = ['frontend', 'backend'] as const;
  const CATEGORY_LABELS: Record<string, string> = {
    frontend: 'Frontend',
    backend: 'Backend'
  };

  function formatDate(value: string): string {
    const [year, month, day] = value.split('-').map((p) => Number(p));
    if (!year || !month || !day) return value;
    return new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(year, month - 1, day));
  }

  // url.searchParams is forbidden during prerender; read it only in
  // the browser. The $derived re-runs whenever page.url changes, so
  // client-side reactivity is preserved.
  function urlParam(key: string): string {
    if (!browser) return '';
    return page.url.searchParams.get(key) ?? '';
  }

  const urlFilter = $derived(urlParam('filter'));
  const urlTag = $derived(urlParam('tag'));

  const subcategoryNames = $derived(
    Object.keys(data.topicsBySubcategory).sort((a, b) => {
      const catA = data.topicsBySubcategory[a]?.[0]?.category ?? 'frontend';
      const catB = data.topicsBySubcategory[b]?.[0]?.category ?? 'frontend';
      if (catA !== catB) {
        return categoryOrder.indexOf(catA) - categoryOrder.indexOf(catB);
      }
      return a.localeCompare(b);
    })
  );

  /** Cards show the first N topics unless expanded. */
  const CARD_INITIAL_TOPICS = 5;

  /** Per-card expand state — expanding one card never re-renders the others. */
  let expandedSubcats = $state<Record<string, boolean>>({});

  // A subcategory selected via ?filter=… defaults to expanded so the whole
  // subcategory is visible; clearing the filter resets cards to the collapsed
  // default. Tag filters are ignored here — they don't change card expansion.
  function syncFilterExpansion(): void {
    expandedSubcats = urlFilter ? { [urlFilter]: true } : {};
  }

  $effect.pre(() => {
    syncFilterExpansion();
  });

  /** Tag → occurrence count across the whole library (not the filtered view). */
  const tagCounts = $derived(
    data.allTopics.reduce<Record<string, number>>((acc, topic) => {
      for (const tag of topic.tags) {
        acc[tag] = (acc[tag] ?? 0) + 1;
      }
      return acc;
    }, {})
  );

  /** All tags sorted by frequency desc, then alphabetically for stable order. */
  const tagsByFrequency = $derived(
    Object.entries(tagCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  );

  const TOP_TAG_COUNT = 25;

  /** Top-N tags shown by default; "Show all X tags" reveals the rest. */
  let showAllTags = $state(false);

  const topTags = $derived(tagsByFrequency.slice(0, TOP_TAG_COUNT));

  // Keep the actively-filtered tag visible even when it falls outside the
  // top-N slice (it is pinned to the front so its pressed state stays clear).
  const visibleTags = $derived.by(() => {
    if (showAllTags) return tagsByFrequency;
    if (urlTag) {
      const activeEntry = tagsByFrequency.find(([tag]) => tag === urlTag);
      if (activeEntry && !topTags.some(([tag]) => tag === urlTag)) {
        return [activeEntry, ...topTags];
      }
    }
    return topTags;
  });

  const visibleTopics = $derived(
    data.allTopics.filter((t) => {
      const matchFilter = urlFilter === '' || t.subcategory === urlFilter;
      const matchTag = urlTag === '' || t.tags.includes(urlTag);
      return matchFilter && matchTag;
    })
  );

  const recentTopics = $derived(data.allTopics.slice(0, 5));

  const visibleTopicsBySubcategory = $derived(
    visibleTopics.reduce<Record<string, TopicSchema[]>>((acc, t) => {
      (acc[t.subcategory] ??= []).push(t);
      return acc;
    }, {})
  );

  const visibleSubcategoryNames = $derived(
    subcategoryNames.filter((name) => (visibleTopicsBySubcategory[name]?.length ?? 0) > 0)
  );

  function visibleCount(subcategory: string): number {
    return visibleTopicsBySubcategory[subcategory]?.length ?? 0;
  }

  function setTag(tag: string): void {
    const url = new URL(page.url);
    if (url.searchParams.get('tag') === tag) {
      url.searchParams.delete('tag');
    } else {
      url.searchParams.set('tag', tag);
    }
    goto(url.href, { keepFocus: true, noScroll: true, replaceState: true });
  }
</script>

<svelte:head>
  <title>Under The Hood — multi-depth technical interview hub</title>
  <meta
    name="description"
    content="A distraction-free, multi-depth technical learning and interview hub for frontend and backend concepts — ELI5 to under-the-hood mechanics."
  />
</svelte:head>

<!-- Hero -->
<section class="px-1 pb-8 sm:pb-12" aria-labelledby="hero-title">
  <div class="max-w-3xl">
    <h1 id="hero-title" class="text-balance text-3xl font-bold tracking-tight text-text sm:text-4xl">
      <span translate="no">Under The Hood</span>
    </h1>
    <p class="mt-3 text-base leading-relaxed text-text-muted sm:text-lg">
      Every topic is explained at four depths — an ELI5 metaphor, a practical
      junior walkthrough, a senior architectural view, and the real
      under-the-hood mechanics. No fluff, no videos, just the machinery.
    </p>
    <div class="mt-6 w-full sm:max-w-xl">
      <SearchBar onopen={openSearch} />
    </div>
    <div class="mt-4 flex flex-wrap gap-3">
      <Button href="/#frontend" variant="primary">
        Browse frontend
        <ArrowRight class="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button href="/#backend" variant="secondary">
        Browse backend
        <ArrowRight class="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
    <p class="mt-4 text-sm text-text-muted">
      {data.allTopics.length} topics · press
      <kbd class="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs">⌘&nbsp;K</kbd>
      to search.
    </p>
  </div>
</section>

<!-- Framework / concept grid -->
<section aria-labelledby="grid-title">
  <div class="flex items-center gap-2">
    <Layers class="h-5 w-5 text-accent" aria-hidden="true" />
    <h2 id="grid-title" class="text-balance text-xl font-bold text-text sm:text-2xl">
      Topic library
    </h2>
  </div>
  <p class="mt-1 text-sm text-text-muted">
    {#if urlFilter || urlTag}
      Showing {visibleTopics.length} of {data.allTopics.length} topics.
      <a href="/" class="font-medium text-accent underline-offset-2 hover:underline">Clear filters</a>
    {:else}
      Grouped by framework and stack.
    {/if}
  </p>

  {#if visibleTopics.length > 0}
    {#each categoryOrder as category (category)}
      {@const namesInCategory = visibleSubcategoryNames.filter(
        (name) => (visibleTopicsBySubcategory[name]?.[0]?.category ?? 'frontend') === category
      )}
      {#if namesInCategory.length > 0}
        <h3 id={category} class="mt-8 scroll-mt-24 text-lg font-semibold text-text">
          {CATEGORY_LABELS[category]}
        </h3>
        <div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {#each namesInCategory as name (name)}
            {@const topics = visibleTopicsBySubcategory[name] ?? []}
            {@const isExpanded = expandedSubcats[name] ?? false}
            {@const shownTopics = isExpanded ? topics : topics.slice(0, CARD_INITIAL_TOPICS)}
            <article
              class:ring-2={urlFilter === name}
              class:ring-accent={urlFilter === name}
              class="flex flex-col rounded-xl border border-border bg-surface p-4 transition-colors hover:border-accent/60"
            >
              <div class="flex items-center justify-between gap-2">
                <h4 class="font-mono text-base font-semibold text-text" translate="no">{name}</h4>
                <Badge label={`${visibleCount(name)} topics`} tone="neutral" />
              </div>
              <ul class="mt-3 flex flex-1 flex-col gap-0.5">
                {#each shownTopics as topic (topic.id)}
                  <li>
                    <a
                      href={`/${topic.category}/${topic.subcategory}/${topic.id}/`}
                      class="group flex min-h-11 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-text-muted transition-colors hover:bg-canvas hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                      data-sveltekit-preload-data="hover"
                    >
                      <span class="min-w-0 truncate">{topic.title}</span>
                      <ChevronRight
                        class="h-4 w-4 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
                        aria-hidden="true"
                      />
                    </a>
                  </li>
                {/each}
              </ul>
              {#if topics.length > CARD_INITIAL_TOPICS}
                <button
                  type="button"
                  onclick={() => {
                    expandedSubcats[name] = !isExpanded;
                  }}
                  aria-expanded={isExpanded}
                  class="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-1 rounded-md border border-border bg-canvas px-3 py-2 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
                >
                  {isExpanded ? 'Show less' : `Show all ${topics.length} topics`}
                  <ChevronDown
                    class={cn('h-3.5 w-3.5 shrink-0 transition-transform', isExpanded && 'rotate-180')}
                    aria-hidden="true"
                  />
                </button>
              {/if}
            </article>
          {/each}
        </div>
      {/if}
    {/each}
  {:else}
    <div class="mt-8 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
      <p class="text-sm text-text-muted">No topics found matching this filter.</p>
      <a
        href="/"
        class="mt-3 inline-flex min-h-11 items-center rounded-md border border-border bg-canvas px-4 py-2 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      >
        Reset filter
      </a>
    </div>
  {/if}
</section>

<!-- Concept matrix -->
<section class="mt-10" aria-labelledby="matrix-title">
  <div class="flex items-center gap-2">
    <Tag class="h-5 w-5 text-accent" aria-hidden="true" />
    <h2 id="matrix-title" class="text-balance text-xl font-bold text-text sm:text-2xl">
      Concept matrix
    </h2>
  </div>
  <p class="mt-1 text-sm text-text-muted">
    Filter the library by concept — click a chip to toggle it.
  </p>
  <div class="mt-3 flex flex-wrap gap-2">
    {#each visibleTags as [tag, count] (tag)}
      <button
        type="button"
        class:bg-accent={urlTag === tag}
        class:text-canvas={urlTag === tag}
        class="inline-flex min-h-11 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        aria-pressed={urlTag === tag}
        onclick={() => setTag(tag)}
      >
        <span class="min-w-0" translate="no">{tag}</span>
        <span
          class={cn(
            'inline-flex items-center rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums',
            urlTag === tag ? 'bg-canvas/30 text-canvas' : 'bg-canvas text-text-muted'
          )}
          aria-hidden="true"
        >
          {count}
        </span>
      </button>
    {/each}
  </div>
  {#if tagsByFrequency.length > TOP_TAG_COUNT}
    <button
      type="button"
      onclick={() => (showAllTags = !showAllTags)}
      aria-expanded={showAllTags}
      class="mt-3 inline-flex min-h-11 items-center gap-1 rounded-full border border-border bg-surface px-4 py-2 text-xs font-medium text-text-muted transition-colors hover:border-accent hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
    >
      {showAllTags ? 'Show less' : `Show all ${tagsByFrequency.length} tags`}
      <ChevronDown
        class={cn('h-3.5 w-3.5 shrink-0 transition-transform', showAllTags && 'rotate-180')}
        aria-hidden="true"
      />
    </button>
  {/if}
</section>

<!-- Recent updates -->
<section class="mt-10" aria-labelledby="recent-title">
  <div class="flex items-center gap-2">
    <CalendarClock class="h-5 w-5 text-accent" aria-hidden="true" />
    <h2 id="recent-title" class="text-balance text-xl font-bold text-text sm:text-2xl">
      Recent updates
    </h2>
  </div>
  <ul class="mt-3 divide-y divide-border rounded-xl border border-border bg-surface">
    {#each recentTopics as topic (topic.id)}
      <li>
        <a
          href={`/${topic.category}/${topic.subcategory}/${topic.id}/`}
          class="flex min-h-11 items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          data-sveltekit-preload-data="hover"
        >
          <span class="min-w-0 flex-1 truncate text-text">{topic.title}</span>
          <Badge label={topic.subcategory} tone="accent" />
          <time datetime={topic.lastUpdated} class="shrink-0 font-mono text-xs text-text-muted">
            {formatDate(topic.lastUpdated)}
          </time>
        </a>
      </li>
    {/each}
  </ul>
</section>