// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// URL publica del sitio. Ajusta SITE_URL al publicar.
// GitHub Pages con repo "lipofungi":  https://<usuario>.github.io/lipofungi
// Con dominio propio:                  https://lipofungi.com
const SITE_URL =
  process.env.SITE_URL?.trim() || 'https://lipofungi.github.io/lipofungi';

// https://astro.build
export default defineConfig({
  site: SITE_URL,
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  compressHTML: true,
});
