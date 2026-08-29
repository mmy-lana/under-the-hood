import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

export default [
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } }
  },
  // Delegate TypeScript parsing inside Svelte files to the TS parser.
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  {
    files: ['**/*.svelte.ts', '**/*.svelte.js'],
    languageOptions: {
      parserOptions: {
        parser: ts.parser
      }
    }
  },
  {
    // Rules disabled deliberately (documented deviations):
    // - no-at-html-tags: the site's core architecture renders build-time
    //   Shiki HTML strings via {@html}; all input is trusted, generated
    //   server-side during prerender — never user-supplied.
    // - no-navigation-without-resolve: a brand-new rule requiring the
    //   `resolve()` API from $app/paths. This static SSG uses plain
    //   internal hrefs (crawlable, trailing-slash aware); adopting the API
    //   would rewrite every link for no runtime benefit.
    // - prefer-svelte-reactivity: `new URL(...)` is used imperatively for
    //   history.replaceState, not as reactive state; SvelteURL would be
    //   semantically wrong here.
    files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js', '**/*.ts', '**/*.tsx'],
    rules: {
      'svelte/no-at-html-tags': 'off',
      'svelte/no-navigation-without-resolve': 'off',
      'svelte/prefer-svelte-reactivity': 'off'
    }
  },
  prettier,
  { ignores: ['build/', '.svelte-kit/', 'node_modules/'] }
];