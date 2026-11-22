import type { APIRoute, GetStaticPaths } from 'astro';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import { sortedPosts } from '../../lib/posts';

const root = resolve('src/post-media');
const maxSize = 25 * 1024 * 1024;
const types: Record<string, string> = {
  avif: 'image/avif', gif: 'image/gif', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
  webp: 'image/webp', mp4: 'video/mp4', webm: 'video/webm', vtt: 'text/vtt',
};

export const getStaticPaths = (async () => {
  const files = new Set<string>();

  for (const post of await sortedPosts(import.meta.env.DEV)) {
    const links = post.body?.match(/\/media\/[^\s"'<>()[\]{}]+/g) ?? [];
    for (const url of [post.data.cover, ...links]) {
      if (url?.startsWith('/media/')) files.add(decodeURIComponent(url.slice('/media/'.length)));
    }
  }

  return [...files].map(file => ({ params: { file } }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ params }) => {
  const file = params.file ?? '';
  const path = resolve(root, file);
  const type = types[file.split('.').at(-1)?.toLowerCase() ?? ''];
  if (!path.startsWith(root + sep) || !type) throw new Error(`Unsupported post media: ${file}`);
  const body = await readFile(path);
  if (body.byteLength > maxSize) throw new Error(`Post media exceeds the 25 MiB Pages limit: ${file}`);
  return new Response(new Uint8Array(body), { headers: { 'Content-Type': type } });
};
