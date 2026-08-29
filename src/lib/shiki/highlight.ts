import { getSingletonHighlighter } from 'shiki';

/**
 * Build-time-only syntax highlighting. Runs inside +page.server.ts load
 * functions during prerender; this module must never be imported into client
 * code (the guard below makes accidental client imports fail loudly).
 *
 * A single `dark-plus` theme keeps every code block on #1E1E1E regardless of
 * the active UI theme — matching the SPEC invariant exactly.
 */

const THEME = 'dark-plus';

const LANGS = [
  'typescript',
  'javascript',
  'tsx',
  'jsx',
  'svelte',
  'vue',
  'html',
  'css',
  'json',
  'java',
  'go',
  'python',
  'rust',
  'bash',
  'yaml'
] as const;

/** Language aliases used in content JSON → Shiki bundled language ids. */
const LANG_ALIASES: Record<string, string> = {
  ts: 'typescript',
  js: 'javascript',
  node: 'javascript',
  py: 'python',
  yml: 'yaml',
  golang: 'go',
  rs: 'rust',
  shell: 'bash'
};

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

async function createHighlighter() {
  return getSingletonHighlighter({
    themes: [THEME],
    langs: [...LANGS]
  });
}

function resolveLang(lang: string): string {
  return LANG_ALIASES[lang] ?? lang;
}

function escapeHtml(code: string): string {
  return code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Tag every rendered line with its 1-based number so CSS can show a gutter
 * (`::before { content: attr(data-line) }`) with tabular-nums alignment.
 * Shiki emits `<span class="line">` per source line.
 */
function addLineNumbers(html: string): string {
  let line = 0;
  return html.replace(/<span class="line">/g, () => {
    line += 1;
    return `<span class="line" data-line="${line}">`;
  });
}

/**
 * Returns a Shiki HTML string (a `<pre class="shiki …">` element). Unknown or
 * unloadable languages degrade to a plain escaped <pre> so content typos never
 * break the build.
 */
export async function highlight(code: string, lang: string): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Shiki highlight() must only run in a server context during prerender'
    );
  }
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter();
  }
  const highlighter = await highlighterPromise;
  const resolved = resolveLang(lang);
  try {
    const html = highlighter.codeToHtml(code, { lang: resolved, theme: THEME });
    return addLineNumbers(html);
  } catch (error) {
    if (error instanceof Error && /language.*not.*found|No grammar|Unknown lang/i.test(error.message)) {
      return `<pre class="shiki dark-plus" style="background-color:#1e1e1e;color:#f8fafc;padding:1rem;overflow-x:auto;tab-size:4"><code>${escapeHtml(code)}</code></pre>`;
    }
    throw error;
  }
}

/** Highlight a code snippet without loading any extra machinery (same pipeline). */
export { highlight as highlightSnippet };