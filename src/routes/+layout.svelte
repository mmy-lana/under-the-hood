<script lang="ts">
  import '../app.css';
  import { setContext } from 'svelte';
  import { page } from '$app/state';
  import HeaderNav from '$lib/components/organisms/HeaderNav.svelte';
  import SidebarToC from '$lib/components/organisms/SidebarToC.svelte';
  import SearchPalette from '$lib/components/molecules/SearchPalette.svelte';
  import { isCmdK } from '$lib/utils/keyboard';
  import type { TopicSchema } from '$lib/content/schema';
  import type { SearchRecord } from '$lib/types';

  /** The only route-data fields the layout chrome consumes (PERF-001). */
  interface LayoutPageData {
    summaries?: TopicSchema[];
    allTopics?: TopicSchema[];
    topic?: TopicSchema;
    description?: string;
  }

  /** Deployed origin used for canonical / Open Graph URLs (SEO-001). */
  const SITE_ORIGIN = 'https://underthehood.mmylana.my.id';
  const DEFAULT_DESCRIPTION =
    'A distraction-free, multi-depth technical learning and interview hub for frontend and backend concepts — ELI5 to under-the-hood mechanics.';
  const SITE_TITLE = 'Under The Hood — multi-depth technical interview hub';

  // PERF-001: sidebar + search run off server-built list-view summaries that
  // arrive through page data — the client bundle carries no content JSON.
  const routeData = $derived(page.data as LayoutPageData);
  const navTopics = $derived(routeData.summaries ?? routeData.allTopics ?? []);
  const searchIndex = $derived<SearchRecord[]>(
    navTopics.map((t) => ({
      id: t.id,
      title: t.title,
      category: t.category,
      subcategory: t.subcategory,
      tags: t.tags,
      // `frameworks` is not one of the Fuse ranking keys; left empty on purpose.
      frameworks: [],
      href: `/${t.category}/${t.subcategory}/${t.id}/`
    }))
  );

  const canonicalUrl = $derived(SITE_ORIGIN + page.url.pathname);
  const ogTitle = $derived(routeData.topic ? `${routeData.topic.title} — Under The Hood` : SITE_TITLE);
  const ogDescription = $derived(routeData.description ?? DEFAULT_DESCRIPTION);

  /** Context key shared with the homepage so its hero search can open the palette. */
  const SEARCH_OPEN_KEY = 'uth:search-open';

  interface LayoutProps {
    children: import('svelte').Snippet;
  }

  let { children }: LayoutProps = $props();

  let drawerOpen = $state(false);
  let searchOpen = $state(false);

  const activeId = $derived(page.params.id);

  // Homepage (no active topic) spans full width: desktop ToC hidden, mobile
  // drawer untouched.
  const isHome = $derived(!activeId);

  setContext<() => void>(SEARCH_OPEN_KEY, openSearch);

  // Close the drawer when the route changes (navigation via sidebar links).
  $effect(() => {
    void page.url.pathname;
    drawerOpen = false;
  });

  // Global Cmd/Ctrl+K listener.
  $effect(() => {
    const handler = (event: KeyboardEvent): void => {
      if (isCmdK(event)) {
        event.preventDefault();
        searchOpen = !searchOpen;
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      window.removeEventListener('keydown', handler);
    };
  });

  function openDrawer(): void {
    drawerOpen = true;
  }

  function closeDrawer(): void {
    drawerOpen = false;
  }

  function openSearch(): void {
    searchOpen = true;
  }

  function closeSearch(): void {
    searchOpen = false;
  }
</script>

<!-- SEO-001: canonical + Open Graph for every route (descriptions are
     server-derived per page, with the homepage default applied here). -->
<svelte:head>
  <link rel="canonical" href={canonicalUrl} />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Under The Hood" />
  <meta property="og:title" content={ogTitle} />
  <meta property="og:description" content={ogDescription} />
  <meta property="og:url" content={canonicalUrl} />
</svelte:head>

<div id="app-shell">
  <HeaderNav onnav={openDrawer} onsearch={openSearch} />

  <div class="mx-auto flex max-w-screen-2xl gap-6 px-3 sm:px-4 xl:gap-8">
    <SidebarToC
      topics={navTopics}
      activeId={activeId}
      open={drawerOpen}
      onclose={closeDrawer}
      hideDesktop={isHome}
    />
    <main id="main" tabindex="-1" class="min-w-0 flex-1 px-1 py-6 sm:px-2 sm:py-8">
      {@render children()}
    </main>
  </div>

  <footer class="border-t border-border">
    <div class="mx-auto flex max-w-screen-2xl flex-col gap-2 px-3 py-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <p translate="no">
        Under The Hood — a multi-depth technical interview hub.
      </p>
      <p class="flex items-center gap-3">
        <a
          href="/NOTICE"
          class="rounded underline-offset-2 transition-colors hover:text-accent hover:underline focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
        >
          Third-party licenses
        </a>
        <span>
          Press <kbd class="rounded border border-border bg-surface px-1 font-mono">⌘&nbsp;K</kbd> to search.
        </span>
      </p>
    </div>
  </footer>
</div>

<SearchPalette open={searchOpen} onclose={closeSearch} index={searchIndex} />