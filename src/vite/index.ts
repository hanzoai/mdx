import { mergeConfig, type Plugin, type UserConfig } from 'vite';
import { buildConfig } from '@/config/build';
import { ValidationError } from '@/utils/validation';
import { createMdxLoader } from '@/loaders/mdx';
import { toVite } from '@/loaders/adapter';
import type { FSWatcher } from 'chokidar';
import { _Defaults, createCore } from '@/core';
import { createIntegratedConfigLoader } from '@/loaders/config';
import { createMetaLoader } from '@/loaders/meta';
import indexFile, { IndexFilePluginOptions } from '@/plugins/index-file';

/**
 * Docs packages the consumer app renders content with. They are left out of
 * dependency pre-bundling and kept in the Vite pipeline, and must resolve to a
 * single instance: `@hanzo/docs-core` holds the source/TOC context the
 * generated `.source` index binds to.
 */
const DocsDeps = ['@hanzo/docs-core', '@hanzo/docs-openapi', '@hanzo/ui'];

/**
 * The 8.x component layer underneath `@hanzo/ui`. Two copies of the
 * `@hanzogui/*` core mean two style contexts, which renders unstyled output, so
 * these are deduped and bundled for SSR — but *not* added to
 * `optimizeDeps.exclude`: the core has to stay pre-bundled as one unit.
 */
const GuiDeps = ['@hanzo/gui', '@hanzogui/core', '@hanzogui/web'];

export interface PluginOptions {
  /**
   * Generate index files for accessing content.
   *
   * @defaultValue true
   */
  index?: boolean | IndexFilePluginOptions;

  /**
   * @defaultValue source.config.ts
   */
  configPath?: string;

  /**
   * Update Vite config to fix module resolution of the docs packages
   *
   * @defaultValue true
   */
  updateViteConfig?: boolean;

  /**
   * Output directory of generated files
   *
   * @defaultValue '.source'
   */
  outDir?: string;
}

export default async function mdx(
  config: Record<string, unknown>,
  pluginOptions: PluginOptions = {},
): Promise<Plugin> {
  const options = applyDefaults(pluginOptions);
  const core = createViteCore(options);
  await core.init({
    config: buildConfig(config),
  });

  const configLoader = createIntegratedConfigLoader(core);
  const mdxLoader = toVite(createMdxLoader(configLoader));
  const metaLoader = toVite(
    createMetaLoader(configLoader, {
      // vite has built-in plugin for JSON files
      json: 'json',
    }),
  );

  return {
    name: '@hanzo/mdx',
    // needed, otherwise other plugins will be executed before our `transform`.
    enforce: 'pre',
    config(config) {
      if (!options.updateViteConfig) return config;

      return mergeConfig(config, {
        optimizeDeps: {
          exclude: DocsDeps,
        },
        resolve: {
          noExternal: [...DocsDeps, ...GuiDeps],
          dedupe: [...DocsDeps, ...GuiDeps],
        },
      } satisfies UserConfig);
    },
    async buildStart() {
      await core.emit({ write: true });
    },
    async configureServer(server) {
      await core.initServer({
        watcher: server.watcher as unknown as FSWatcher,
      });
    },
    async transform(value, id) {
      try {
        if (metaLoader.filter(id)) {
          return await metaLoader.transform.call(this, value, id);
        }

        if (mdxLoader.filter(id)) {
          return await mdxLoader.transform.call(this, value, id);
        }
      } catch (e) {
        if (e instanceof ValidationError) {
          throw new Error(await e.toStringFormatted());
        }

        throw e;
      }
    },
  };
}

export async function postInstall(pluginOptions: PluginOptions = {}) {
  const { loadConfig } = await import('@/config/load-from-file');
  const core = createViteCore(applyDefaults(pluginOptions));
  await core.init({
    config: loadConfig(core, true),
  });
  await core.emit({ write: true });
}

function createViteCore({
  index,
  configPath,
  outDir,
}: Required<PluginOptions>) {
  if (index === true) index = {};

  return createCore({
    environment: 'vite',
    configPath,
    outDir,
    plugins: [
      index &&
        indexFile({
          ...index,
          target: index.target ?? 'vite',
        }),
    ],
  });
}

function applyDefaults(options: PluginOptions): Required<PluginOptions> {
  return {
    updateViteConfig: options.updateViteConfig ?? true,
    index: options.index ?? true,
    configPath: options.configPath ?? _Defaults.configPath,
    outDir: options.outDir ?? _Defaults.outDir,
  };
}
