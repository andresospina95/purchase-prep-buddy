// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Para deploy en Azure (Container Apps / App Service / VM) usamos el preset
// `node-server` de TanStack Start en vez de Cloudflare Workers. Esto genera
// un server Node estándar en `dist/server/index.mjs` que se levanta con `node`.
export default defineConfig({
  tanstackStart: {
    target: "node-server",
  },
});
