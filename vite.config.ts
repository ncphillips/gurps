import { existsSync } from 'node:fs'
import path from 'node:path'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { defineConfig, type Plugin } from 'vite'

const systemId = 'gurps'
const foundryUrl = 'http://localhost:30000'

/**
 * Resolves the TypeScript-style `./foo.js` specifiers that already point at `./foo.ts`.
 *
 * `tsc` accepts them because of `rewriteRelativeImportExtensions`; Rollup takes the specifier
 * literally and fails on the missing file. Only relative specifiers are rewritten, and only when the
 * `.ts` sibling actually exists, so a genuine `.js` file always wins.
 */
function resolveTsExtensions(): Plugin {
  return {
    name: 'gurps:resolve-ts-extensions',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer || !source.startsWith('.') || !source.endsWith('.js')) return null

      const candidate = path.resolve(path.dirname(importer), source.slice(0, -3) + '.ts')
      return existsSync(candidate) ? candidate : null
    },
  }
}

export default defineConfig(({ mode }) => ({
  // `esmodules` in `system.json` names `module/gurps.js`, so the bundle keeps that exact path.
  base: `/systems/${systemId}/`,
  publicDir: false,
  resolve: {
    alias: {
      module: path.resolve(import.meta.dirname, 'module'),
      lib: path.resolve(import.meta.dirname, 'lib'),
    },
  },
  server: {
    port: 30001,
    open: false,
    proxy: {
      [`^(?!/systems/${systemId}/)`]: { target: foundryUrl, changeOrigin: true },
      '/socket.io': { target: foundryUrl, ws: true },
    },
  },
  build: {
    outDir: 'dist',
    // `build:styles` and `build:static` have already populated `dist` by the time this runs.
    emptyOutDir: false,
    sourcemap: true,
    minify: mode === 'production',
    target: 'es2022',
    lib: {
      entry: path.resolve(import.meta.dirname, 'module/gurps.js'),
      formats: ['es'],
      fileName: () => 'module/gurps.js',
    },
    rollupOptions: {
      output: {
        entryFileNames: 'module/gurps.js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
  plugins: [resolveTsExtensions(), svelte()],
}))
