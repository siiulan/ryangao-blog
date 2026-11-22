import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ base: './src/content/posts', pattern: '*.mdoc' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    status: z.enum(['draft', 'published']).default('draft'),
    featured: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    cover: z.string().nullable().optional(),
    coverAlt: z.string().default(''),
    sample: z.boolean().default(false),
    artwork: z.enum(['auto', 'emblem', 'mountains', 'reflection']).default('auto'),
  }).refine(post => !post.cover || post.coverAlt.trim(), {
    path: ['coverAlt'],
    message: 'Add alternative text for the cover image.',
  }),
});

export const collections = { posts };
