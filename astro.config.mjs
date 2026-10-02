// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// ---------------------------------------------------------------------------
// URL publica del sitio.
// GitHub Pages con repo "lipofungi":  https://<usuario>.github.io/lipofungi
// Con dominio propio:                  https://lipofungi.com
// ---------------------------------------------------------------------------
const SITE_URL =
  process.env.SITE_URL?.trim() || 'https://lipofungi.github.io/lipofungi';

// ---------------------------------------------------------------------------
// Path base. GitHub Pages publica el sitio en un SUBDIRECTORIO
// (<usuario>.github.io/<repo>), no en la raiz del dominio.
// Sin esto, los assets se piden en /_astro/... en vez de /<repo>/_astro/...
// y el CSS no carga. Se deriva automaticamente de SITE_URL.
// Con dominio propio el path es "/" y no cambia nada.
// ---------------------------------------------------------------------------
const url = new URL(SITE_URL);
const base = url.pathname.replace(/\/+$/, ''); // "" si esta en la raiz

// https://astro.build
export default defineConfig({
  site: SITE_URL,
  base,
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  compressHTML: true,
});
