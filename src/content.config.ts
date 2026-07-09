import { defineCollection, z } from 'astro:content';
import matter from 'gray-matter';

// Minimal shape of the Astro 7 loader context we use (avoids deep internal import).
interface LoaderContext {
  collection: string;
  store: { set(entry: { id: string; data: Record<string, unknown>; body?: string; filePath?: string }): void };
  logger: { info(msg: string): void; warn(msg: string): void };
}

const OWNER = process.env.GITHUB_OWNER ?? 'cvbsm';
const REPO = process.env.GITHUB_REPO ?? 'cvbsm-content';
const BRANCH = process.env.GITHUB_BRANCH ?? 'main';
const POSTS_DIR = process.env.GITHUB_POSTS_DIR ?? 'blog';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${POSTS_DIR}`;
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/${POSTS_DIR}`;

/**
 * Astro 7 Content Layer loader: pulls Markdown + frontmatter from the configured
 * GitHub repo at build time and stores each post in the content DataStore, so every
 * blog post is emitted as fully prerendered, SEO-ready HTML at `astro build`.
 */
const loader = {
  name: 'github-blog-loader',
  async load(context: LoaderContext): Promise<void> {
    const token = process.env.GITHUB_TOKEN;
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'cvbsm-astro-loader',
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    let files: { name: string; path: string; download_url: string }[] = [];
    try {
      const listing = await fetchJson(`${API_BASE}?ref=${BRANCH}`, headers);
      files = (listing as any[]).filter((f) => /\.(md|markdown)$/i.test(f.name));
    } catch (e) {
      // Fallback for local dev / PoC: load from src/sample/ when the repo
      // is unreachable or not configured. Swap in real GitHub vars at build time.
      context.logger.warn(`github-blog-loader: falling back to local sample posts (${(e as Error).message})`);
      files = await localSamplePosts();
    }

    for (const file of files) {
      const raw = file.download_url.startsWith('http')
        ? await fetchText(file.download_url, headers)
        : await readLocal(file.download_url);
      const { data, content } = matter(raw) as { data: Record<string, any>; content: string };
      if (data.trashed || data.draft) continue;

      const id = file.name.replace(/\.(md|markdown)$/i, '');
      const storeData: Record<string, unknown> = {
        ...data,
        id,
        // Local samples already carry absolute/relative cover; GitHub path -> CDN.
        cover: data.cover
          ? file.download_url.startsWith('http')
            ? `${CDN_BASE}/${String(data.cover).replace(/^\/+/, '')}`
            : String(data.cover)
          : undefined,
      };
      context.store.set({ id, data: storeData, body: content, filePath: file.path });
    }
    context.logger.info(`github-blog-loader: loaded ${files.length} post(s)`);
  },
};

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
async function localSamplePosts(): Promise<{ name: string; path: string; download_url: string }[]> {
  const dir = fileURLToPath(new URL('./sample/', import.meta.url));
  const { readdir } = await import('node:fs/promises');
  const names = (await readdir(dir)).filter((n) => /\.(md|markdown)$/i.test(n));
  return names.map((n) => ({ name: n, path: `sample/${n}`, download_url: `local:${dir}${n}` }));
}
async function readLocal(localPath: string): Promise<string> {
  return readFile(localPath.replace(/^local:/, ''), 'utf-8');
}

async function fetchJson(url: string, headers: Record<string, string>): Promise<any> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} for ${url}`);
  return res.json();
}
async function fetchText(url: string, headers: Record<string, string>): Promise<string> {
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`Fetch failed ${res.status} for ${url}`);
  return res.text();
}

const blog = defineCollection({
  type: 'content_layer',
  loader,
  schema: z.object({
    title: z.string(),
    description: z.string().default(''),
    pubDate: z.string(), // "YYYY-MM-DD HH:mm" — parsed in pages via new Date()
    updatedDate: z.string().optional(),
    tags: z.array(z.string()).default([]),
    category: z.string().default('General'),
    cover: z.string().optional(), // CDN url, resolved by the loader
    trashed: z.boolean().default(false), // soft-delete (review §6)
    draft: z.boolean().default(false),
    author: z.string().default('CV Bangun Sarana Makmur'),
  }),
});

// Astro 7: collections are exported as an aggregated `collections` object.
export { blog as blog };
export const collections = { blog };
