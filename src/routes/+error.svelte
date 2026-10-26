<script lang="ts">
  import { page } from '$app/state';

  const notFound = $derived(page.status === 404);
</script>

<svelte:head>
  <title>{notFound ? 'Page not found' : 'Something went wrong'} — Under The Hood</title>
  <meta
    name="description"
    content="The page you were looking for is not here — jump back into the Under The Hood topic library."
  />
</svelte:head>

<!-- SEO-003: branded error page (rendered inside the app chrome) with a clear
     recovery path instead of a bare platform error. -->
<section class="mx-auto max-w-2xl px-1 py-12 text-center">
  <p class="text-sm font-bold uppercase tracking-wider text-accent">{page.status}</p>
  <h1 class="mt-2 text-balance text-3xl font-bold tracking-tight text-text">
    {notFound ? 'Page not found' : 'Something went wrong'}
  </h1>
  <p class="mt-3 text-base leading-relaxed text-text-muted">
    {notFound
      ? 'This topic does not exist (or may have moved). The library below is a good place to start over.'
      : 'An unexpected error occurred. Try again, or head back to the library.'}
  </p>
  <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
    <a
      href="/"
      class="inline-flex min-h-11 items-center justify-center rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-canvas transition-colors hover:opacity-90 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas focus-visible:outline-none"
    >
      Back to the library
    </a>
    <a
      href="/#frontend"
      class="inline-flex min-h-11 items-center justify-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text transition-colors hover:border-accent hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
    >
      Browse frontend topics
    </a>
  </div>
  <p class="mt-6 text-sm text-text-muted">
    Press <kbd class="rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-xs">⌘&nbsp;K</kbd> to search all topics.
  </p>
</section>
