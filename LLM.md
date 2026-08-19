# Hanzo Mdx

## Overview
MDX processing library for Hanzo

## Tech Stack
- **Language**: TypeScript/JavaScript
- **Build**: tsup. Stay on `typescript` 5.x -- TS7 breaks tsup's `rollup-plugin-dts`.
  `types:check` is `tsc --noEmit`; do not add `@typescript/native-preview`.

## Scope -- no UI surface
This package is MDX *processing* only: remark/MDX loaders and the
next/vite/webpack/bun/node adapters. It ships no React components and
declares no component library -- not even an optional peer -- so the
dependency tree is free of tailwind, radix and shadcn.

Components live in the component layer (`@hanzo/ui` 8.x on `@hanzo/gui`);
import them from there, never through `@hanzo/mdx`. The generated `.source`
index imports the runtime from this package's own `./runtime/*` entries.

The one place the component layer is named is `src/vite/index.ts`, which
merges resolution settings into the *consumer's* Vite config -- strings only,
no import, no dependency:

- `DocsDeps` (`@hanzo/docs-core`, `@hanzo/docs-openapi`, `@hanzo/ui`) are left
  out of dependency pre-bundling and kept single-instance.
- `GuiDeps` (`@hanzo/gui`, `@hanzogui/core`, `@hanzogui/web`) are deduped and
  bundled for SSR but deliberately *not* added to `optimizeDeps.exclude`: two
  copies of the `@hanzogui/*` core mean two style contexts and unstyled output,
  and the core has to stay pre-bundled as one unit.

Entries for packages a consumer does not install are inert, so the list costs
nothing when only part of the stack is present.

## Known gap
`pnpm lint` has never run in this repo: `eslint.config.mjs` imports
`eslint-config-custom/library.js`, a workspace-only package from the monorepo
this was extracted from, and `eslint` itself is not a devDependency. The npm
package of that name is an unrelated 0.0.0 placeholder -- do not install it to
make the import resolve. `hanzo.yml` now runs `pnpm run lint` on every push, so
the gap fails a lane instead of hiding in one; fixing it means choosing a real
config, not restoring the old import.

## Build & Run
```bash
pnpm install && pnpm build
pnpm test
```

## Structure
```
mdx/
  CHANGELOG.md
  LICENSE
  eslint.config.mjs
  loader-mdx.cjs
  loader-meta.cjs
  package.json
  pnpm-lock.yaml
  src/
  test/
  tsconfig.json
  tsup.config.ts
  vitest.config.ts
```

## Key Files
- `package.json` -- Dependencies and scripts
