import { existsSync } from 'node:fs';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

export const portfolio = 'https://siiulan.github.io/portfolio/#contact';
export const siteTitle = 'Ryan Gao’s Blog';
export const siteDescription = 'Notes on building for the web, design in motion, and the details worth keeping.';

const art = {
  emblem: '/art/post-emblem.webp',
  mountains: '/art/post-mountains.webp',
  reflection: '/art/post-reflection.webp',
};

export const sortedPosts = async (includeDrafts = false) =>
  (await getCollection('posts', ({ data, filePath }) => {
    if (!includeDrafts && data.status !== 'published') return false;
    // The file watcher can report a Keystatic deletion just after the next dev request.
    return !import.meta.env.DEV || !filePath || existsSync(filePath);
  })).sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id));

export const postUrl = (post: Post) => `/posts/${encodeURIComponent(post.id)}/`;
export const editUrl = (post: Post) => `/keystatic/collection/posts/item/${encodeURIComponent(post.id)}`;
export const coverFor = (post: Post) =>
  post.data.cover || art[post.data.artwork === 'auto' ? 'mountains' : post.data.artwork];
export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }).format(date);
export const readingMinutes = (post: Post) =>
  Math.max(1, Math.ceil((post.body?.match(/\p{L}+/gu)?.length ?? 0) / 220));

export const tagKey = (tag: string) =>
  tag.trim().normalize('NFKC').toLowerCase().replace(/[\s/]+/g, '-');

export const tagUrl = (tag: string) => `/tags/${encodeURIComponent(tagKey(tag))}/`;
