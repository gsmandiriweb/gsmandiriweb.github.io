// @ts-check
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Only needed if you deploy to GitHub Pages (enables correct base/asset paths).
// const GITHUB_PAGES = !!process.env.GITHUB_PAGES;

export default defineConfig({
  // Static output => 100% serverless, deploy to any static host / CDN.
  output: 'static',
  site: 'https://cvbsm.example.com',
  integrations: [
    svelte(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  // Optional: uncomment when deploying to project Pages.
  // base: GITHUB_PAGES ? '/<repo>' : undefined,
});
