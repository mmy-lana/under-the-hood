<script lang="ts">
  import { AlertTriangle, BookOpen, ChevronDown, Lightbulb } from '@lucide/svelte';
  import { cn } from '$lib/utils/cn';
  import type { InterviewGotcha } from '$lib/content/schema';

  interface InterviewGotchaCardProps {
    gotcha: InterviewGotcha;
    index: number;
    defaultOpen?: boolean;
  }

  let { gotcha, index, defaultOpen = false }: InterviewGotchaCardProps = $props();

  // PERF-002: initialise from the prop so the prerendered HTML already shows
  // the default-open card — the old `$effect` flip happened post-hydration and
  // pushed everything below it down (CLS 0.34 on restored-scroll loads).
  // The initial-value capture below is intended (SSR-accurate starting state).
  // svelte-ignore state_referenced_locally
  let open = $state(defaultOpen);
  const regionId = $derived(`gotcha-${index}`);
  const buttonId = $derived(`gotcha-button-${index}`);
</script>

<article class="overflow-hidden rounded-xl border border-border bg-surface">
  <h3 class="text-base font-semibold text-text">
    <button
      id={buttonId}
      type="button"
      aria-expanded={open}
      aria-controls={regionId}
      class="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-canvas focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none"
      onclick={() => (open = !open)}
    >
      <span class="text-xs font-bold uppercase tracking-wide text-accent">
        Gotcha {index + 1}
      </span>
      <span class="min-w-0 flex-1 text-balance">{gotcha.question}</span>
      <ChevronDown
        class={cn('h-5 w-5 shrink-0 text-text-muted transition-transform', open && 'rotate-180')}
        aria-hidden="true"
      />
    </button>
  </h3>

  <div
    id={regionId}
    role="region"
    aria-labelledby={buttonId}
    hidden={!open}
    class="border-t border-border"
  >
    <div class="space-y-4 px-4 py-4 sm:px-5">
      <section class="reading-prose">
        <h4 class="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
          <BookOpen class="h-4 w-4 text-accent" aria-hidden="true" />
          Context
        </h4>
        <p class="text-sm leading-relaxed text-text-muted">{gotcha.contextIntro}</p>
      </section>

      <section class="reading-prose">
        <h4 class="mb-1 flex items-center gap-2 text-sm font-semibold text-text">
          <Lightbulb class="h-4 w-4 text-accent" aria-hidden="true" />
          The mechanical answer
        </h4>
        <p class="text-sm leading-relaxed text-text">{gotcha.detailedAnswer}</p>
      </section>

      <section class="rounded-md border border-red-500/30 bg-red-500/5 p-3">
        <!-- text-danger: data-theme-driven color (A11Y-002); the old
             `text-red-600 dark:text-red-400` keyed off the OS scheme and fell
             to 2.9:1 when Obsidian met a light OS. -->
        <h4 class="mb-1 flex items-center gap-2 text-sm font-semibold text-danger">
          <AlertTriangle class="h-4 w-4" aria-hidden="true" />
          Trap
        </h4>
        <p class="text-sm leading-relaxed text-text">{gotcha.trapWarning}</p>
      </section>
    </div>
  </div>
</article>