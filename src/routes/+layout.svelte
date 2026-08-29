<script lang="ts">
  import '../app.css';
  import { page } from '$app/state';
  import HeaderNav from '$lib/components/organisms/HeaderNav.svelte';
  import SidebarToC from '$lib/components/organisms/SidebarToC.svelte';
  import SearchPalette from '$lib/components/molecules/SearchPalette.svelte';
  import { allTopics, searchIndex } from '$lib/content';
  import { isCmdK } from '$lib/utils/keyboard';

  interface LayoutProps {
    children: import('svelte').Snippet;
  }

  let { children }: LayoutProps = $props();

  let drawerOpen = $state(false);
  let searchOpen = $state(false);

  const activeId = $derived(page.params.id);

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

<div id="app-shell">
  <HeaderNav onnav={openDrawer} onsearch={openSearch} />

  <div class="mx-auto flex max-w-screen-2xl px-3 sm:px-4">
    <SidebarToC topics={allTopics} activeId={activeId} open={drawerOpen} onclose={closeDrawer} />
    <main id="main" tabindex="-1" class="min-w-0 flex-1 py-6 sm:py-8">
      {@render children()}
    </main>
  </div>

  <footer class="border-t border-border">
    <div class="mx-auto flex max-w-screen-2xl flex-col gap-2 px-3 py-6 text-xs text-text-muted sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <p translate="no">
        Under The Hood — a multi-depth technical interview hub.
      </p>
      <p>Press <kbd class="rounded border border-border bg-surface px-1 font-mono">⌘&nbsp;K</kbd> to search.</p>
    </div>
  </footer>
</div>

<SearchPalette open={searchOpen} onclose={closeSearch} index={searchIndex} />