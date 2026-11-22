import { defineConfig } from 'astro/config';
import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import keystatic from '@keystatic/astro';

const localWorkspace = {
  name: 'local-workspace',
  hooks: {
    'astro:config:setup': ({ injectRoute }) => {
      injectRoute({ pattern: '/manage', entrypoint: './src/local/ManagePosts.astro' });
    },
  },
};

export default defineConfig({
  site: 'https://blog.siiulan.dev',
  devToolbar: { enabled: false },
  server: { host: '127.0.0.1' },
  integrations: [markdoc(), sitemap(), react(), ...(process.argv.includes('dev') ? [keystatic(), localWorkspace] : [])],
});
