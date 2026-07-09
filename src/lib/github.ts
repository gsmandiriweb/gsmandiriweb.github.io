// Svelte 5 (runes) client for GitHub's REST Contents API.
// All calls run in the browser using a fine-grained PAT the admin pastes locally.
// Security: the PAT is never sent anywhere except api.github.com. It is held only
// in component state for the session. (See review §3 / §6.)

interface GitHubEnv {
  owner: string;
  repo: string;
  branch: string;
  postsDir: string;
}

export interface PostInput {
  slug: string;
  title: string;
  description: string;
  pubDate: string; // "YYYY-MM-DDTHH:mm"
  category: string;
  tags: string;
  cover: string; // repo-relative path, optional
  body: string; // raw markdown
}

const API = 'https://api.github.com';

export function apiBase(env: GitHubEnv) {
  return `${API}/repos/${env.owner}/${env.repo}/contents/${env.postsDir}`;
}

export async function uploadImage(
  env: GitHubEnv,
  token: string,
  filename: string,
  dataUrl: string // "data:image/png;base64,...."
): Promise<string> {
  const m = dataUrl.match(/^data:(.*?);base64,(.*)$/);
  if (!m) throw new Error('Invalid image data URL');
  const b64 = m[2];
  const path = `${env.postsDir}/images/${filename}`;
  await putContent(env, token, path, b64, `Add image ${filename}`);
  // Return the CDN (jsDelivr) URL the public site will use.
  return `https://cdn.jsdelivr.net/gh/${env.owner}/${env.repo}@${env.branch}/${path}`;
}

export async function createOrUpdatePost(
  env: GitHubEnv,
  token: string,
  input: PostInput,
  sha?: string
): Promise<void> {
  const frontmatter = [
    '---',
    `title: ${JSON.stringify(input.title)}`,
    `description: ${JSON.stringify(input.description)}`,
    `pubDate: ${input.pubDate.replace('T', ' ')}`,
    `category: ${JSON.stringify(input.category)}`,
    `tags: ${JSON.stringify(input.tags.split(',').map((t) => t.trim()).filter(Boolean))}`,
    input.cover ? `cover: ${JSON.stringify(input.cover)}` : '',
    'trashed: false',
    'draft: false',
    '---',
    '',
  ]
    .filter(Boolean)
    .join('\n');

  const path = `${env.postsDir}/${input.slug}.md`;
  const content = utf8ToBase64(frontmatter + input.body);
  await putContent(env, token, path, content, `Publish ${input.slug}`, sha);
}

// Batch scheduler: given a start date + interval, compute sequential pubDates
// and push each post.
export async function batchSchedule(
  env: GitHubEnv,
  token: string,
  posts: PostInput[],
  startISO: string,
  intervalHours: number
): Promise<void> {
  let cursor = new Date(startISO).getTime();
  for (const p of posts) {
    p.pubDate = new Date(cursor).toISOString().slice(0, 16);
    await createOrUpdatePost(env, token, p);
    cursor += intervalHours * 3600 * 1000;
  }
}

async function putContent(
  env: GitHubEnv,
  token: string,
  path: string,
  contentBase64: string,
  message: string,
  sha?: string
): Promise<void> {
  const res = await fetch(`${apiBase(env)}/${path.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: JSON.stringify({ message, content: contentBase64, branch: env.branch, ...(sha ? { sha } : {}) }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub ${res.status}: ${err}`);
  }
}

export async function listPosts(env: GitHubEnv, token: string): Promise<{ name: string; sha: string; path: string }[]> {
  const res = await fetch(`${apiBase(env)}?ref=${env.branch}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const items = await res.json();
  return items.filter((f: any) => /\.md$/i.test(f.name));
}

export async function getPost(
  env: GitHubEnv,
  token: string,
  path: string
): Promise<{ content: string; sha: string }> {
  const res = await fetch(`${apiBase(env)}/${path.split('/').map(encodeURIComponent).join('/')}?ref=${env.branch}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  const data = await res.json();
  return { content: atob(data.content), sha: data.sha };
}

export async function deletePost(env: GitHubEnv, token: string, path: string, sha: string): Promise<void> {
  const res = await fetch(`${apiBase(env)}/${path.split('/').map(encodeURIComponent).join('/')}?ref=${env.branch}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/vnd.github+json' },
    body: JSON.stringify({ message: `Delete ${path}`, branch: env.branch, sha }),
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
}

/** UTF-8-safe Base64 encoder (replaces deprecated unescape trick). */
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
