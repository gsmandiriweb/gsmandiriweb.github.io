import { defineCollection, z } from 'astro:content';
import matter from 'gray-matter';
import { readFile, writeFile, mkdir, readdir, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';

// Minimal shape of the Astro 7 loader context we use (avoids deep internal import).
interface LoaderContext {
  collection: string;
  store: { set(entry: { id: string; data: Record<string, unknown>; body?: string; filePath?: string }): void };
  logger: { info(msg: string): void; warn(msg: string): void };
}

const OWNER = process.env.GITHUB_OWNER ?? 'gsmandiriweb';
const REPO = process.env.GITHUB_REPO ?? 'gsmandiriweb.github.io';
const BRANCH = process.env.GITHUB_BRANCH ?? 'main';
const POSTS_DIR = process.env.GITHUB_POSTS_DIR ?? 'blog';
const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${POSTS_DIR}`;
const CDN_BASE = `https://cdn.jsdelivr.net/gh/${OWNER}/${REPO}@${BRANCH}/${POSTS_DIR}`;

// Rate-limit defense (see README §Rate limits).
//  - GITHUB_TOKEN in .env lifts 60 -> 5000 req/hr (read-only fine-grained PAT).
//  - Fetched posts are cached to .cache/blog/ and reused when the API is
//    rate-limited or offline, so `astro dev`/`astro build` keep working.
const CACHE_DIR = fileURLToPath(new URL('../.cache/blog/', import.meta.url));
const USE_CACHE = process.env.GITHUB_CACHE !== '0';

interface RawPost { name: string; path: string; download_url: string; raw: string }

/**
 * Astro 7 Content Layer loader: pulls Markdown + frontmatter from the configured
 * GitHub repo at build/dev time and stores each post in the content DataStore, so
 * every blog post is emitted as fully prerendered, SEO-ready HTML.
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

    let posts: RawPost[] | null = null;
    try {
      const listing = await fetchJson(`${API_BASE}?ref=${BRANCH}`, headers);
      const files = (listing as any[]).filter((f) => /\.(md|markdown)$/i.test(f.name));
      posts = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          path: f.path,
          download_url: f.download_url,
          raw: await fetchText(f.download_url, headers),
        }))
      );
      if (USE_CACHE) await writeCache(posts);
      context.logger.info(`github-blog-loader: fetched ${posts.length} post(s) from GitHub`);
    } catch (e) {
      const msg = (e as Error).message;
      // Rate-limited or offline -> reuse last good cache instead of failing the build.
      if (USE_CACHE && existsSync(CACHE_DIR)) {
        context.logger.warn(`github-blog-loader: GitHub unavailable (${msg}); using cached posts`);
        posts = await readCache();
      } else {
        throw e;
      }
    }

    if (!posts) {
      context.logger.warn('github-blog-loader: no posts (and no cache)');
      return;
    }

    for (const file of posts) {
      const { data, content } = matter(file.raw) as { data: Record<string, any>; content: string };
      if (data.trashed || data.draft) continue;

      const id = file.name.replace(/\.(md|markdown)$/i, '');
      const storeData: Record<string, unknown> = {
        ...data,
        id,
        cover: data.cover
          ? `${CDN_BASE}/${String(data.cover).replace(/^\/+/, '')}`
          : undefined,
      };
      context.store.set({ id, data: storeData, body: content, filePath: file.path });
    }
    context.logger.info(`github-blog-loader: loaded ${posts.length} post(s)`);
  },
};

async function writeCache(posts: RawPost[]): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(`${CACHE_DIR}/index.json`, JSON.stringify(posts.map((p) => ({ name: p.name, path: p.path, download_url: p.download_url }))), 'utf-8');
  for (const p of posts) await writeFile(`${CACHE_DIR}/${p.name}`, p.raw, 'utf-8');
}
async function readCache(): Promise<RawPost[]> {
  const idx = JSON.parse(await readFile(`${CACHE_DIR}/index.json`, 'utf-8')) as { name: string; path: string; download_url: string }[];
  return Promise.all(
    idx.map(async (m) => ({
      ...m,
      raw: await readFile(`${CACHE_DIR}/${m.name}`, 'utf-8'),
    }))
  );
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
