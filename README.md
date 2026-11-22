# RyanG Blog

Ryan Gao’s personal blog. Astro builds the public HTML, and Keystatic writes Markdoc files in the local checkout.

## Write locally

Use Node 24 with the npm lockfile.

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4321. The development server binds to localhost because the authoring tools can change files in this checkout.

- **New post** opens the editor. Write the article, add a summary, and save the entry as Draft to start.
- **Manage posts** lists drafts and published posts. **Preview** opens the saved article in the public reading layout. **Edit or delete** opens the editor, where **Delete entry** opens a confirmation dialog. The editor also links to the saved preview.
- Use the image block for an inline image or **Image with caption** for a figure. Add alt text to informative images and use the **Video** block for short MP4 or WebM files. Add a WebVTT captions file when the clip has dialogue or meaningful sound.
- Set **Status** to Published when the article is ready. If several posts are marked Featured, the most recent one gets the homepage feature. The sample posts are explicitly labeled in the public layout and can be deleted or set to Draft before launch.

Post files live in `src/content/posts/`. Editor uploads live in `src/post-media/`. Review and commit the relevant files together when publishing. Keep private drafts and uploads out of Git if the remote is public.

For agents or scripts creating posts from another project, use the [post authoring guide](docs/post-authoring.md).

## Verify the static site

```sh
npm run build
npm run preview
```

The production build writes to `dist/`. It includes published pages, their referenced local media, the sitemap, and RSS. A post asset above Cloudflare’s 25 MiB static asset limit fails the build. Caption files should use the `.vtt` extension. The editor, author controls, and draft pages are only available in development.

## Deploy to Cloudflare Workers

The site deploys as a static-assets-only Worker configured in `wrangler.jsonc`. There is no Worker script, so asset requests are free and do not count toward the Workers Free plan's daily request limit.

To deploy from your machine:

```sh
npm run deploy
```

To deploy from Git, create a Worker with **Import a repository** and select `siiulan/ryangao-blog`.

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Node version | `24` via `.nvmrc` |

Run the first deploy and verify the generated `workers.dev` URL. Then attach `blog.siiulan.dev` under **Settings → Domains & Routes → Custom domain** and confirm DNS and HTTPS. Pushes to `main` will publish subsequent updates after a successful build.

## Background video

The homepage and article reader share a muted background playlist. Blue liquid, Black metal, and Silver waves play in order and repeat. Each clip fades in and out over half a second, with a 100 ms black gap before the next clip starts. The clips are grouped under `src/assets/backgrounds/`. Black metal uses a smaller web encode. The centered homepage title uses Inter and a three-second shine on “Blog”. Reduced-motion visitors get the dark static background and a solid-color title without downloading the videos.

On desktop, the lower preview sits beside a right-hand post list. Opening an article in the workspace updates the address to `/home/?post=<slug>` and expands the reader in the same document, so the video keeps playing. The top-right Posts button opens the list over the article. Each article also has a standalone static page at `/posts/<slug>/` for direct links, RSS, and readers without JavaScript.
