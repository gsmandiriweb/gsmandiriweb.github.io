<script lang="ts">
  import { getContext } from 'svelte';
  import {
    type PostInput,
    listPosts,
    getPost,
    createOrUpdatePost,
    deletePost,
    uploadImage,
    batchSchedule,
  } from '../lib/github';

  // Svelte 5 runes.
  let token = $state('');
  let owner = $state(import.meta.env.PUBLIC_GITHUB_OWNER ?? 'cvbsm');
  let repo = $state(import.meta.env.PUBLIC_GITHUB_REPO ?? 'cvbsm-content');
  let branch = $state(import.meta.env.PUBLIC_GITHUB_BRANCH ?? 'main');
  let postsDir = $state(import.meta.env.PUBLIC_GITHUB_POSTS_DIR ?? 'blog');

  let posts = $state<{ name: string; sha: string; path: string }[]>([]);
  let status = $state('');
  let busy = $state(false);

  // Editor form state.
  let form = $state<PostInput>({
    slug: '', title: '', description: '', pubDate: '', category: '', tags: '', cover: '', body: '',
  });
  let editingSha = $state<string | undefined>(undefined);

  // Batch scheduler state.
  let batchText = $state(''); // newline-separated "slug|title|body" for demo
  let batchStart = $state('');
  let batchInterval = $state(48);

  const env = $derived({ owner, repo, branch, postsDir });

  async function refresh() {
    if (!token) { status = 'Masukkan PAT terlebih dahulu.'; return; }
    busy = true; status = 'Memuat daftar...';
    try {
      posts = await listPosts(env, token);
      status = `${posts.length} artikel ditemukan.`;
    } catch (e) { status = 'Gagal: ' + (e as Error).message; }
    busy = false;
  }

  async function edit(path: string, sha: string) {
    busy = true; status = 'Memuat artikel...';
    try {
      const raw = (await getPost(env, token, path)).content;
      // crude frontmatter strip for demo
      const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
      const fm = m?.[1] ?? ''; const body = m?.[2] ?? raw;
      const get = (k: string) => (fm.match(new RegExp(`${k}:\\s*"?([^"\\n]*)`))?.[1] ?? '').trim();
      form = {
        slug: path.split('/').pop()!.replace(/\.md$/, ''),
        title: get('title'), description: get('description'),
        pubDate: get('pubDate').replace(' ', 'T'), category: get('category'),
        tags: get('tags'), cover: get('cover'), body,
      };
      editingSha = sha;
      status = 'Siap diedit.';
    } catch (e) { status = 'Gagal: ' + (e as Error).message; }
    busy = false;
  }

  async function save() {
    if (!form.slug || !form.title) { status = 'Slug & judul wajib.'; return; }
    busy = true; status = 'Menyimpan...';
    try {
      await createOrUpdatePost(env, token, form, editingSha);
      status = 'Tersimpan. Jalankan rebuild (Actions) agar publikasi.';
      await refresh();
    } catch (e) { status = 'Gagal: ' + (e as Error).message; }
    busy = false;
  }

  async function remove(path: string, sha: string) {
    if (!confirm('Hapus permanen ' + path + '?')) return;
    busy = true; status = 'Menghapus...';
    try { await deletePost(env, token, path, sha); status = 'Terhapus.'; await refresh(); }
    catch (e) { status = 'Gagal: ' + (e as Error).message; }
    busy = false;
  }

  function onImage(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      busy = true; status = 'Mengunggah gambar...';
      try {
        const url = await uploadImage(env, token, file.name, reader.result as string);
        form.cover = url.replace(/^https:\/\/cdn\.jsdelivr\.net\/gh\/[^\/]+\/[^\/]+@[^\/]+\//, '');
        status = 'Gambar terunggah: ' + form.cover;
      } catch (err) { status = 'Gagal: ' + (err as Error).message; }
      busy = false;
    };
    reader.readAsDataURL(file);
  }

  async function runBatch() {
    const lines = batchText.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length || !batchStart) { status = 'Isi batch & tanggal mulai.'; return; }
    busy = true; status = 'Menjadwal batch...';
    const inputs: PostInput[] = lines.map((l) => {
      const [slug, title, ...rest] = l.split('|');
      return { slug: slug.trim(), title: (title ?? slug).trim(), description: '', pubDate: '', category: 'Batch', tags: '', cover: '', body: rest.join('|') };
    });
    try {
      await batchSchedule(env, token, inputs, batchStart, Number(batchInterval));
      status = `Terjadwal ${inputs.length} artikel.`;
      await refresh();
    } catch (e) { status = 'Gagal: ' + (e as Error).message; }
    busy = false;
  }

  // On mount, attempt autoload if a token was previously entered (sessionStorage).
  import { onMount } from 'svelte';
  onMount(() => {
    const saved = sessionStorage.getItem('cvbsm_pat');
    if (saved) { token = saved; refresh(); }
  });
  function persist() { sessionStorage.setItem('cvbsm_pat', token); }
</script>

<div class="wrap">
  <h1>Admin — Blog CMS</h1>

  <section class="auth">
    <label>GitHub PAT (fine-grained, Contents:write)
      <input type="password" bind:value={token} oninput={persist} placeholder="ghp_..." />
    </label>
    <div class="env">
      <input bind:value={owner} placeholder="owner" />
      <input bind:value={repo} placeholder="repo" />
      <input bind:value={branch} placeholder="branch" />
      <input bind:value={postsDir} placeholder="posts dir" />
    </div>
    <button onclick={refresh} disabled={busy}>Muat Daftar</button>
    <p class="status">{status}</p>
  </section>

  <section class="editor">
    <h2>Editor</h2>
    <div class="grid">
      <input bind:value={form.slug} placeholder="slug (tanpa .md)" />
      <input bind:value={form.title} placeholder="Judul" />
      <input bind:value={form.description} placeholder="Deskripsi" />
      <input bind:value={form.pubDate} type="datetime-local" placeholder="Tanggal publikasi" />
      <input bind:value={form.category} placeholder="Kategori" />
      <input bind:value={form.tags} placeholder="tag, dipisah koma" />
    </div>
    <p>Cover: {form.cover || '—'}</p>
    <input type="file" accept="image/*" onchange={onImage} />
    <textarea bind:value={form.body} rows="12" placeholder="Markdown..."></textarea>
    <div class="row">
      <button onclick={save} disabled={busy}>Simpan</button>
      <button onclick={() => { form = { slug:'', title:'', description:'', pubDate:'', category:'', tags:'', cover:'', body:'' }; editingSha = undefined; }}>Baru</button>
    </div>
  </section>

  <section class="list">
    <h2>Daftar Artikel</h2>
    <ul>
      {#each posts as p (p.sha)}
        <li>
          <span>{p.name}</span>
          <button onclick={() => edit(p.path, p.sha)}>Edit</button>
          <button onclick={() => remove(p.path, p.sha)}>Hapus</button>
        </li>
      {/each}
    </ul>
  </section>

  <section class="batch">
    <h2>Batch Scheduler</h2>
    <p>Format tiap baris: <code>slug|Judul|isi markdown</code></p>
    <textarea bind:value={batchText} rows="6" placeholder="post-1|Judul Satu|Lorem ipsum..."></textarea>
    <div class="row">
      <label>Mulai <input type="datetime-local" bind:value={batchStart} /></label>
      <label>Interval (jam) <input type="number" bind:value={batchInterval} min="1" /></label>
      <button onclick={runBatch} disabled={busy}>Jadwalkan Batch</button>
    </div>
  </section>
</div>

<style>
  .wrap { max-width: 760px; margin: 0 auto; padding: 2rem 1rem; font-family: system-ui, sans-serif; }
  section { border: 1px solid #e5e0d8; border-radius: 10px; padding: 1rem 1.2rem; margin: 1rem 0; }
  label { display: block; margin: .4rem 0; font-size: .9rem; }
  input, textarea, button { font: inherit; padding: .5rem .7rem; border: 1px solid #ccc; border-radius: 6px; width: 100%; }
  .env { display: grid; grid-template-columns: repeat(4, 1fr); gap: .4rem; margin: .5rem 0; }
  .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: .4rem; }
  .row { display: flex; gap: .5rem; margin-top: .6rem; }
  button { background: #b3261e; color: #fff; border: none; cursor: pointer; width: auto; }
  button:disabled { opacity: .5; }
  .status { color: #655643; font-size: .85rem; }
  ul { list-style: none; padding: 0; }
  li { display: flex; gap: .5rem; align-items: center; padding: .35rem 0; border-bottom: 1px solid #f0ece4; }
  li span { flex: 1; }
  code { background: #f4f1ea; padding: .1rem .3rem; border-radius: 3px; }
</style>
