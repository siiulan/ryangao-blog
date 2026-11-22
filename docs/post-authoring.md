# Create a RyanG Blog post from another project

Work in a checkout of `ryangao-blog`. The blog uses Astro to build the site and Keystatic in local storage mode for editing. For automated creation, write a Markdoc file and copy any media into the checkout. Keystatic opens the same files for later editing at `/keystatic/collection/posts` on the local dev server. The published site has no post-writing API.

## Post file

Create `src/content/posts/<slug>.mdoc` with YAML frontmatter followed by the article in Markdoc. Choose a unique lowercase, hyphen-separated slug such as `what-i-learned-building-a-release-preview`. The filename sets the URL. Keep the slug stable after publishing and check for an existing file before writing. For an authorized update, edit that file in place.

| Field | What to provide |
| --- | --- |
| `title` | Required. A plain-text article title. |
| `description` | Required. A short summary, ideally one or two sentences. It appears in the homepage preview, the article, and link metadata. |
| `date` | Required. Publication date as a quoted `'YYYY-MM-DD'` string. Posts are sorted newest first. |
| `status` | `draft` or `published`. Use `draft` when preparing a post for review. Set `published` when explicitly asked to make it public. |
| `featured` | Optional boolean, default `false`. The newest published post marked `true` gets the homepage feature. With no featured posts, the newest published post is featured. |
| `tags` | Optional YAML list of topic names, default `[]`. Reuse existing labels for the same topics. |
| `cover` | Optional local cover URL such as `/media/<slug>/cover.webp`. |
| `coverAlt` | Required if you provide `cover`. Briefly describe the meaningful content of the image. |
| `sample` | Optional boolean, default `false`. Use `true` for demo posts that should be labeled as samples. |
| `artwork` | Optional fallback with values `auto` (default), `emblem`, `mountains`, or `reflection`. `auto` uses the mountain artwork for cards and social shares. An explicit choice also shows the art in the article when there is no custom cover. |

Put the article below the closing `---`. Start with an opening paragraph and use `##` for sections because the layout renders the title as the page's `h1`. Use Markdown links, lists, quotes, and language-tagged code fences. The byline and reading time come from the site.

Example file at `src/content/posts/what-i-learned-building-a-release-preview.mdoc`. Replace the sample text, date, and image descriptions with the post's own content.

```md
---
title: "What I learned building a release preview"
description: "How a preview page made it easier to review changes before shipping."
date: '2026-11-22'
status: draft
featured: false
tags: [Web, Design]
cover: /media/what-i-learned-building-a-release-preview/cover.webp
coverAlt: "A release preview showing a proposed update beside the current layout"
---

The preview gave reviewers a shared place to see the proposed changes.

## What changed

I moved the most important differences to the top so reviewers could find them without scrolling.

{% Figure src="/media/what-i-learned-building-a-release-preview/comparison.webp" alt="The updated preview lists layout changes before the release notes" caption="The review screen after the layout update." /%}
```

## Images and media

Store assets under `src/post-media/<slug>/` and reference them at `/media/<slug>/<filename>`. Use lowercase kebab-case filenames with extensions. For example, the cover above lives at `src/post-media/what-i-learned-building-a-release-preview/cover.webp`. Keep the article and its referenced assets together.

| Placement | Recommended asset |
| --- | --- |
| Cover, thumbnail, and social preview | Supply **one 1200 × 630 px landscape image** in WebP or JPEG. The site reuses `cover` for the article, archive, sidebar, and social metadata. Keep the main subject near the center so it survives the roughly 4:3 sidebar crop and wide 2.5:1 archive crop. Use imagery that remains legible in a small thumbnail. The lower homepage preview uses the title and summary. |
| Inline screenshots and figures | Aim for **1200–1600 px wide** when the source supports it. Keep the original aspect ratio and check that text is readable on mobile. WebP or JPEG suit photos. WebP or PNG suit crisp screenshots and diagrams. |

Use standard Markdoc image syntax for an inline image, such as `![Settings panel with the preview option enabled](/media/my-post/settings.webp)`. Use `Figure` for an optional visible caption. For short videos, use `{% Video src="/media/my-post/demo.mp4" title="Release preview walkthrough" captions="/media/my-post/demo.vtt" /%}`. Include English WebVTT captions for speech or meaningful audio. Optional visible captions use the `caption` attribute.

Keep cover images around **300 KB or less** when the image stays sharp. The media build accepts AVIF, GIF, JPEG, PNG, WebP, MP4, WebM, and VTT, with a hard **25 MiB per file** limit.

## Verify and hand off

1. Use Node 24 and run `npm ci` if dependencies are missing. Start `npm run dev` and open `http://127.0.0.1:4321/posts/<slug>/`. This route previews drafts. Check the article, links, and media on desktop and mobile.
2. Run `npm run build`. The static build includes posts marked `published` and their referenced local media. Drafts are omitted, so check draft content and media through the dev preview.
3. Report the post status, files created, and preview path. Keep private drafts and their media out of a public Git remote. Publishing to the live site requires the published post and its media on the deployment branch.

The current field definitions live in [Astro's content schema](../src/content.config.ts), [the Keystatic editor configuration](../keystatic.config.ts), and [the Markdoc configuration](../markdoc.config.mjs).
