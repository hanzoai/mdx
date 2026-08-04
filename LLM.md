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
depends on no component library, so the dependency tree is free of
tailwind, radix and shadcn.

Components live in the component layer (`@hanzo/ui` 8.x on `@hanzo/gui`);
import them from there, never through `@hanzo/mdx`. The generated `.source`
index imports the runtime from this package's own `./runtime/*` entries.

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
