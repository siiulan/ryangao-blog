import { collection, config, fields } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';

const media = { directory: 'src/post-media', publicPath: '/media/' };

export default config({
  storage: { kind: 'local' },
  ui: { brand: { name: 'RyanG Blog' } },
  collections: {
    posts: collection({
      label: 'Posts',
      path: 'src/content/posts/*',
      slugField: 'title',
      previewUrl: '/posts/{slug}/',
      entryLayout: 'content',
      format: { contentField: 'body' },
      columns: ['title', 'status', 'date'],
      schema: {
        title: fields.slug({ name: { label: 'Title', validation: { isRequired: true } } }),
        description: fields.text({ label: 'Summary', multiline: true, validation: { isRequired: true } }),
        date: fields.date({ label: 'Publication date', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
        status: fields.select({
          label: 'Status',
          options: [{ label: 'Draft', value: 'draft' }, { label: 'Published', value: 'published' }],
          defaultValue: 'draft',
        }),
        featured: fields.checkbox({ label: 'Feature on the homepage' }),
        tags: fields.array(fields.text({ label: 'Tag' }), { label: 'Tags', itemLabel: props => props.value }),
        cover: fields.image({ label: 'Cover image', ...media }),
        coverAlt: fields.text({ label: 'Cover image alternative text' }),
        sample: fields.checkbox({ label: 'Label as a sample post' }),
        artwork: fields.select({
          label: 'Card artwork',
          options: [
            { label: 'Automatic', value: 'auto' },
            { label: 'Emblem', value: 'emblem' },
            { label: 'Mountains', value: 'mountains' },
            { label: 'Reflection', value: 'reflection' },
          ],
          defaultValue: 'auto',
        }),
        body: fields.markdoc({
          label: 'Article',
          options: { image: media },
          components: {
            Figure: block({
              label: 'Image with caption',
              schema: {
                src: fields.image({ label: 'Image', ...media, validation: { isRequired: true } }),
                alt: fields.text({ label: 'Alternative text', validation: { isRequired: true } }),
                caption: fields.text({ label: 'Caption' }),
              },
            }),
            Video: block({
              label: 'Video',
              schema: {
                src: fields.file({ label: 'MP4 or WebM file', ...media, validation: { isRequired: true } }),
                title: fields.text({ label: 'Video title', validation: { isRequired: true } }),
                caption: fields.text({ label: 'Description' }),
                captions: fields.file({ label: 'English captions (.vtt)', ...media }),
              },
            }),
          },
        }),
      },
    }),
  },
});
