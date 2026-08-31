# Under The Hood

> **Deep-dive, distraction-free technical documentation and interview preparation hub — explained across four progressive depths from ELI5 to engine internals.**

[![SvelteKit](https://img.shields.io/badge/SvelteKit-5.0_(Runes)-FF3E00?style=flat&logo=svelte&logoColor=white)](https://svelte.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Static SSG](https://img.shields.io/badge/Rendering-100%25_Static_SSG-10B981?style=flat)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)

---

## Live Demo
* **Main Domain**: [mmylana.my.id](https://mmylana.my.id)
* **Dedicated Subdomain**: `underthehood.mmylana.my.id` *(Deployment configuration in progress)*

---

## Why "Under The Hood"?

Most framework documentations suffer from two extremes:
1. **Too shallow**: Basic tutorials stop at *"here is the syntax, it just works."*
2. **Too fragmented**: You have to jump between 5 different blog posts, GitHub RFCs, and source code files to understand what happens in the DOM, compiler AST, or memory heap when things break.

**Under The Hood** solves this by providing a unified **Universal Concept Matrix** for top Frontend and Backend stacks, structured so anyone from a beginner to a staff engineer can master the underlying mechanics without fluff.

---

## Key Features

* **4 Progressive Cognitive Depths (Zero-Jargon to Engine Level)**:
  *  **ELI5**: Pure physical real-world metaphor (no jargon, zero mention of "DOM" or "memory").
  *  **Junior**: Practical API usage, syntax comparisons, and boilerplate elimination.
  *  **Senior**: Architecture, change detection overhead, lifecycle bounds, and GC pressure.
  *  **Under The Hood**: Low-level runtime/compiler mechanics (AST transforms, DOM `Node.insertBefore`, JVM continuations, Go `hchan` ring buffer mutex, V8 ArrayBuffers).
* **3-Theme Reading Engine**:
  *  **Warm Paper (Kindle / E-Ink)**: Warm parchment `#F7F2E8` with deep charcoal text to eliminate blue-light fatigue. *(Default)*
  *  **Obsidian Dark**: High-contrast slate navy `#0F172A` with JetBrains/VS Code palettes.
  *  **Studio Light**: Clean, crisp daylight reading mode.
  * *Code Invariant*: Code snippets and diff modals always retain an authentic `#1E1E1E` dark IDE theme across all modes for maximum token contrast.
* **Rosetta Stone Cross-Framework Matrix**: Compare syntactic and mechanical equivalents across **React**, **Angular**, **Vue**, and **Svelte** side-by-side.
* **Side-by-Side & Stacked Diff Viewer**:
  * **Desktop ($\ge$1024px)**: 2-column split view with synchronized ratio scrolling.
  * **Mobile (<1024px)**: Stacked vertical stream (Top: Legacy $\rightarrow$ Bottom: Modern) with horizontal code preservation.
* **Interview Gotcha Cards**: Exactly two structured gotchas per topic featuring:
  *  `Context`: The real-world scenario and why interviewers test this.
  *  `The Mechanical Answer`: Concrete technical breakdown.
  *  `Trap Warning`: The common naive assumption candidates make.
* **0ms Static Performance (Zero Client-Side JS Overhead)**:
  * Pre-rendered using SvelteKit SSG (`@sveltejs/adapter-static`).
  * Shiki syntax highlighting runs **strictly at build time** — older mobile devices and laptops parse zero runtime highlighter bundles.
* **Instant Fuzzy Search (`⌘K` / `Ctrl+K`)**: Fast client-side search powered by Fuse.js with highlighted matches (`<mark>`).
* **Scalable Accordion Sidebar**: Subcategories auto-collapse and expand only the active topic's framework to effortlessly support 50+ topics per stack.

---

##  Tech Stack

* **Framework**: SvelteKit 5 (with native Runes: `$state`, `$derived`, `$props()`, `$effect.pre`)
* **Static Site Generation**: `@sveltejs/adapter-static` (`strict: true`, `trailingSlash: 'always'`)
* **Styling**: Tailwind CSS v4 (CSS theme variables and responsive container queries)
* **Syntax Highlighting**: Shiki (build-time static HTML tokenization)
* **Search**: `fuse.js`
* **Icons**: `lucide-svelte`

---

##  Seed Content Library (30 Included Topics)

### Frontend (15 Topics)
* **Angular**: `@for` vs `*ngFor`, `@defer` Deferrable Views, Signals vs RxJS Observables
* **React**: React 19 Compiler Auto-Memoization, Server Components Boundary (RSC), `useEffect` vs DOM Paint Cycle
* **Vue**: Vue 3 Proxy vs Vue 2 `defineProperty`, `<script setup>` Compiler Mechanics, `v-memo` DOM Patch Bailout
* **Svelte**: Svelte 5 Runes vs Svelte 4 `let`, Svelte 5 `{#snippet}` vs Slots, No Virtual DOM Architecture
* **Next.js**: App Router Caching Layers, Server Actions RPC Protocol, Streaming SSR with Suspense

### Backend (15 Topics)
* **Java & Spring Boot**: JVM Stack vs Heap & Escape Analysis, Virtual Threads (Project Loom), Spring Bean Lifecycle & CGLIB Proxies
* **Go (Golang)**: `hchan` Ring Buffer & Mutex Locking, GMP Scheduler & Work Stealing, Slices 3-Word Header & Aliasing
* **Node.js & NestJS**: Event Loop Phases & Microtask Drain, Buffer Memory vs Streams Backpressure, NestJS Dependency Injection Container
* **Python & FastAPI**: CPython GIL vs Asyncio Event Loop, Generator Frame Memory Suspension, FastAPI Pydantic v2 Rust Validation Pipeline
* **Rust**: Borrow Checker & Non-Lexical Lifetimes, Smart Pointers (`Box`, `Rc`, `Arc`), Tokio Work-Stealing Task Scheduler

---

##  Getting Started

### Prerequisites
* Node.js $\ge$ 20.0.0
* `pnpm` $\ge$ 9.0.0

### Installation & Local Development

```bash
# 1. Clone the repository
git clone https://github.com/mmy-lana/under-the-hood.git
cd under-the-hood

# 2. Install dependencies
pnpm install

# 3. Start local development server
pnpm dev

# 4. Open in browser
http://localhost:5173
```

### Production Build & SSG Verification

```bash
# Run type checking
pnpm check

# Build static output to /build
pnpm build

# Preview static build locally
pnpm preview
```

---

## How to Add a New Topic

Adding content requires **zero UI or code configuration**. Simply create a `.json` file under `content/<category>/<subcategory>/<id>.json`:

```json
{
  "id": "my-new-topic",
  "title": "Topic Title",
  "category": "frontend",
  "subcategory": "react",
  "versionContext": "React 19+",
  "lastUpdated": "2026-08-29",
  "tags": ["react", "performance", "dom"],
  "prerequisites": ["Basic understanding of X"],
  "progressiveExplaining": {
    "eli5": "Real-world physical metaphor without any technical jargon.",
    "junior": "Practical API walkthrough and clean modern code.",
    "senior": "Architectural trade-offs, re-renders, and lifecycle bounds.",
    "underTheHood": "Low-level engine execution, AST transforms, memory, and scheduler mechanics."
  },
  "rosettaStone": {
    "react": "// React syntax",
    "vue": "// Vue syntax",
    "angular": "// Angular syntax",
    "svelte": "// Svelte syntax"
  },
  "codeComparison": {
    "title": "Legacy vs Modern Pattern",
    "summary": "Short explanation of the difference.",
    "legacyOrBad": {
      "label": "Legacy Pattern",
      "snippet": "// OLD: ...",
      "fullFile": {
        "filename": "old-file.ts",
        "language": "typescript",
        "code": "// Complete legacy code with inline // OLD comment markers"
      }
    },
    "modernOrGood": {
      "label": "Modern Pattern",
      "snippet": "// NEW: ...",
      "fullFile": {
        "filename": "modern-file.ts",
        "language": "typescript",
        "code": "// Complete modern code with inline // KEY CHANGE comment markers"
      }
    }
  },
  "interviewGotchas": [
    {
      "question": "First tricky interview question?",
      "contextIntro": "Why interviewers ask this and the real-world scenario.",
      "detailedAnswer": "Deep mechanical explanation.",
      "trapWarning": "The common naive mistake candidates make."
    },
    {
      "question": "Second tricky interview question?",
      "contextIntro": "Why interviewers ask this and the real-world scenario.",
      "detailedAnswer": "Deep mechanical explanation.",
      "trapWarning": "The common naive mistake candidates make."
    }
  ]
}
```

On build, the static builder automatically ingests, validates, syntax-highlights, indexes for search, and generates the route.

---

## Future Roadmap & Considerations

Ideas and features planned for future releases:

* [ ] **Reading Progress Bar**: A subtle 2px accent line at the top of the header indicating scroll progress.
* [ ] **Power-User Keyboard Shortcuts**:
  * `J` / `K` $\rightarrow$ Navigate to Previous / Next topic.
  * `1`, `2`, `3`, `4` $\rightarrow$ Quickly jump between reading depths (`ELI5`, `Junior`, `Senior`, `Under The Hood`).
* [ ] **Print / PDF Cheat Sheet Export**: Optimized `@media print` stylesheets to export any article into a 1-page PDF study sheet.
* [ ] **Additional Framework Expansions**:
  * Frontend: SolidJS, Qwik, HTMX, Astro Islands.
  * Backend: Kotlin / Ktor, Bun runtime, Elixir / Phoenix LiveView, Rust Axum.
* [ ] **Interactive Visual Memory / DOM Flowcharts**: Lightweight SVG / ASCII interactive diagram cards showing memory pointer changes and DOM tree operations.
* [ ] **Interview Quiz Mode**: Interactive flashcard mode quizzing candidates on the 2 Gotchas before revealing the mechanical answer.

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Under The Hood** — Crafted with ❤️ by [mmy-lana](https://mmylana.my.id)
