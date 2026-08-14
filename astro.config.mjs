import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.indrairwan.com',
  compressHTML: true,
  adapter: vercel(),
  integrations: [react(), keystatic(), sitemap()],
});
