import type { APIRoute } from 'astro';
import rss from '@astrojs/rss';
import { postUrl, siteDescription, siteTitle, sortedPosts } from '../lib/posts';

export const GET: APIRoute = async ({ site }) => rss({
  title: siteTitle,
  description: siteDescription,
  site: site!,
  items: (await sortedPosts()).map(post => ({
    title: post.data.title,
    description: post.data.description,
    pubDate: post.data.date,
    link: postUrl(post),
  })),
});
