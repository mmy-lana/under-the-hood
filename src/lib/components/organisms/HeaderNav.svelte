<script lang="ts">
  import { goto } from '$app/navigation';
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { Menu, Search, Wrench } from '@lucide/svelte';
  import IconButton from '$lib/components/atoms/IconButton.svelte';
  import ThemeToggle from '$lib/components/atoms/ThemeToggle.svelte';
  import SearchBar from '$lib/components/molecules/SearchBar.svelte';
  import { topicsBySubcategory } from '$lib/content';

  interface HeaderNavProps {
    onnav: () => void;
    onsearch: () => void;
  }

  let { onnav, onsearch }: HeaderNavProps = $props();

  const subcategoryNames = Object.keys(topicsBySubcategory).sort();

  const currentFilter = $derived(browser ? (page.url.searchParams.get('filter') ?? 'all') : 'all');

  function onFilterChange(event: Event): void {
    const value = (event.currentTarget as HTMLSelectElement).value;
    if (value === 'all') {
      goto('/');
      return;
    }
    goto(`/?filter=${encodeURIComponent(value)}`);
  }
</script>

<header
  class="sticky top-0 z-40 border-b border-border bg-canvas/90 backdrop-blur"
  style="padding-top: env(safe-area-inset-top)"
>
  <div class="mx-auto flex h-[var(--hdr-h)] max-w-screen-2xl items-center gap-2 px-3 sm:px-4">
    <IconButton label="Open menu" onclick={onnav} class="xl:hidden">
      <Menu class="h-5 w-5" aria-hidden="true" />
    </IconButton>

    <a
      href="/"
      class="inline-flex min-h-11 min-w-0 items-center gap-2 rounded-md px-1 font-bold text-text transition-colors hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      aria-label="Under The Hood — home"
      data-sveltekit-preload-data="hover"
    >
      <Wrench class="h-5 w-5 text-accent" aria-hidden="true" />
      <span class="truncate text-sm sm:text-base" translate="no">Under The Hood</span>
    </a>

    <nav class="hidden items-center gap-1 xl:flex" aria-label="Primary">
      <a
        href="/#frontend"
        class="min-h-11 rounded-md px-3 py-2 text-sm text-text-muted transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        data-sveltekit-preload-data="hover"
      >
        Frontend
      </a>
      <a
        href="/#backend"
        class="min-h-11 rounded-md px-3 py-2 text-sm text-text-muted transition-colors hover:text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        data-sveltekit-preload-data="hover"
      >
        Backend
      </a>
    </nav>

    <div class="ml-auto flex items-center gap-2">
      <label class="hidden items-center gap-1 text-xs text-text-muted lg:flex">
        <span class="sr-only">Filter topics by framework</span>
        <select
          class="min-h-11 rounded-md border border-border bg-surface px-2 py-2 text-sm text-text focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
          value={currentFilter}
          onchange={onFilterChange}
          aria-label="Filter topics by framework"
        >
          <option value="all">All frameworks</option>
          {#each subcategoryNames as name (name)}
            <option value={name}>{name}</option>
          {/each}
        </select>
      </label>

      <div class="hidden w-56 sm:block" role="search">
        <SearchBar onopen={onsearch} />
      </div>
      <IconButton label="Open search (Command K)" onclick={onsearch} class="sm:hidden">
        <Search class="h-5 w-5" aria-hidden="true" />
      </IconButton>

      <ThemeToggle />
    </div>
  </div>
</header>