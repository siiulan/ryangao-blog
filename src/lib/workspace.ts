const drawer = document.querySelector<HTMLDetailsElement>('[data-post-drawer]');
const settings = document.querySelector<HTMLDetailsElement>('[data-workspace-settings]');
const about = document.querySelector<HTMLDialogElement>('[data-about-dialog]');
const overlays = [drawer, settings];

for (const overlay of overlays) {
  overlay?.querySelector('summary')?.addEventListener('click', () => {
    for (const other of overlays) {
      if (other && other !== overlay) other.open = false;
    }
  });
}

document.addEventListener('pointerdown', event => {
  for (const overlay of overlays) {
    if (overlay?.open && !overlay.contains(event.target as Node)) overlay.open = false;
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || about?.open) return;
  const openOverlay = overlays.find(overlay => overlay?.open);
  if (!openOverlay) return;
  event.preventDefault();
  openOverlay.open = false;
  openOverlay.querySelector('summary')?.focus();
});

settings?.querySelector('[data-open-about]')?.addEventListener('click', () => {
  if (!about) return;
  settings.open = false;
  about.showModal();
});

about?.addEventListener('close', () => settings?.querySelector('summary')?.focus());
about?.addEventListener('click', event => {
  if (event.target === about) about.close();
});

const workspace = document.querySelector<HTMLElement>('[data-inline-workspace]');
if (workspace) mountReader(workspace);

function mountReader(root: HTMLElement) {
  const preview = root.querySelector<HTMLElement>('[data-preview]');
  if (!preview) return;
  const rail = root.querySelector<HTMLElement>('.home-post-rail')!;
  const hero = root.querySelector<HTMLElement>('.workspace-hero')!;
  const panel = root.querySelector<HTMLElement>('.article-surface')!;
  const article = root.querySelector<HTMLElement>('[data-workspace-article]')!;
  const scrollArea = root.querySelector<HTMLElement>('.article-scroll')!;
  const announcement = root.querySelector<HTMLElement>('[data-announcement]')!;
  const edit = root.querySelector<HTMLAnchorElement>('[data-workspace-edit]');
  const read = preview.querySelector<HTMLAnchorElement>('[data-read]');
  const posts = new Map([...rail.querySelectorAll<HTMLAnchorElement>('[data-post-id]')]
    .map(link => [link.dataset.postId!, link]));
  const stacked = matchMedia('(max-width: 760px), (max-height: 579px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const homeTitle = document.title;
  const homeElements = [hero, preview, rail];
  const cache = new Map<string, { node: HTMLElement; title: string }>();
  const windowEase = 'cubic-bezier(.24, .67, .3, 1)';
  window.history.scrollRestoration = 'manual';

  let pending: AbortController | undefined;
  let activePost: string | undefined;
  let homeScroll = 0;
  let animations: Animation[] = [];
  let revision = 0;

  function announce(message: string, error = false) {
    announcement.textContent = message;
    announcement.classList.toggle('visually-hidden', !error);
    announcement.classList.toggle('reader-message', error);
  }

  function selectPreview(link: HTMLAnchorElement) {
    root.querySelector('[data-preview-post][aria-current]')?.removeAttribute('aria-current');
    link.setAttribute('aria-current', 'true');
    const title = preview.querySelector<HTMLElement>('[data-title]')!;
    const sample = preview.querySelector<HTMLElement>('[data-sample]')!;
    title.textContent = link.dataset.title ?? '';
    preview.querySelector('[data-description]')!.textContent = link.dataset.description ?? '';
    preview.querySelector('[data-label]')!.textContent = link.dataset.label ?? '';
    preview.querySelector('[data-meta]')!.textContent = link.dataset.meta ?? '';
    sample.textContent = link.dataset.sample ? ` · ${link.dataset.sample}` : '';
    sample.hidden = !link.dataset.sample;
    if (read) {
      read.href = link.href;
      read.dataset.postId = link.dataset.postId;
    }
    return title;
  }

  function animateMode(open: boolean, animate: boolean) {
    const wasOpen = root.classList.contains('workspace-reading');
    if (wasOpen === open) return;

    const run = ++revision;
    animations.forEach(animation => animation.cancel());
    animations = [];
    const motion = animate && !reducedMotion.matches;
    const wide = !stacked.matches;
    const compact = preview.getBoundingClientRect();
    if (open) homeScroll = window.scrollY;
    if (drawer) {
      drawer.open = false;
      drawer.hidden = true;
    }

    root.classList.toggle('workspace-reading', open);
    root.toggleAttribute('data-closing-post', motion && wide && !open);
    root.toggleAttribute('data-rail-animation', motion && wide);
    for (const element of homeElements) element.inert = open;
    panel.inert = !open;
    panel.hidden = !open && !(motion && wide);
    if (!wide) window.scrollTo(0, open ? 0 : homeScroll);

    if (motion && wide) {
      const full = panel.getBoundingClientRect();
      const top = Math.max(0, compact.top - full.top);
      const bottom = Math.max(0, full.bottom - compact.bottom);
      const right = Math.max(0, full.right - compact.right);
      const left = Math.max(0, compact.left - full.left);
      const expanded = 'inset(0 round 1.3rem)';
      const collapsed = `inset(${top}px ${right}px ${bottom}px ${left}px round 1.3rem)`;
      const cleared = `inset(${top * .35}px ${right}px ${bottom * .35}px ${left}px round 1.3rem)`;
      animations.push(panel.animate(open ? [
        { clipPath: collapsed, easing: windowEase },
        { clipPath: cleared, offset: 300 / 840, easing: windowEase },
        { clipPath: expanded },
      ] : [
        { clipPath: expanded, easing: windowEase },
        { clipPath: collapsed },
      ], { duration: 840, easing: 'linear', fill: 'both' }));

      const railFrames = [
        { opacity: 0, clipPath: 'inset(0 0 90% 0 round 1.25rem)' },
        { opacity: 1, clipPath: 'inset(0 round 1.25rem)' },
      ];
      const slide = rail.animate(open ? railFrames.reverse() : railFrames, {
        duration: 300, easing: 'ease-out', fill: 'both',
      });
      animations.push(slide);
      void slide.finished.then(() => {
        if (run !== revision) return;
        root.removeAttribute('data-rail-animation');
        if (drawer && open) drawer.hidden = false;
      }, () => {});
      animations.push(scrollArea.animate(open ? [
        { opacity: 0 }, { opacity: 0, offset: .18 }, { opacity: 1 },
      ] : [
        { opacity: 1 }, { opacity: 0, offset: .35 }, { opacity: 0 },
      ], { duration: 840, fill: 'both' }));
    } else if (motion && open) {
      animations.push(panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, easing: 'ease-out' }));
    }

    const finish = () => {
      if (run !== revision) return;
      root.removeAttribute('data-closing-post');
      root.removeAttribute('data-rail-animation');
      panel.hidden = !open;
      if (!open) article.replaceChildren();
      if (drawer) drawer.hidden = !open;
      animations.forEach(animation => animation.cancel());
      animations = [];
      if (!open) read?.focus({ preventScroll: true });
    };
    if (animations.length) void Promise.allSettled(animations.map(animation => animation.finished)).then(finish);
    else finish();
  }

  async function loadPost(id: string, link: HTMLAnchorElement, signal: AbortSignal) {
    let entry = cache.get(id);
    if (entry) return entry;

    const response = await fetch(link.href, { signal });
    if (!response.ok) throw new Error('Post unavailable');

    const page = new DOMParser().parseFromString(await response.text(), 'text/html');
    const node = page.querySelector<HTMLElement>('[data-post-article]');
    if (!node) throw new Error('Post content missing');

    // Relative content links should resolve against the article, even inside /home/.
    for (const element of node.querySelectorAll('[href], [src]')) {
      for (const attribute of ['href', 'src']) {
        const value = element.getAttribute(attribute);
        if (value && !value.startsWith('#')) element.setAttribute(attribute, new URL(value, response.url).href);
      }
    }
    entry = { node, title: page.title };
    cache.set(id, entry);
    return entry;
  }

  function homeUrl(id?: string) {
    const url = new URL('/home/', location.origin);
    if (id) url.searchParams.set('post', id);
    return url;
  }

  async function showPost(id: string, push: boolean, animate = true) {
    pending?.abort();
    if (id === activePost) {
      if (drawer) drawer.open = false;
      announce('');
      return;
    }
    const link = posts.get(id);
    if (!link) {
      showHome();
      announce('This post could not be found.', true);
      return;
    }

    const request = new AbortController();
    pending = request;
    announce('Loading post…');
    try {
      const entry = await loadPost(id, link, request.signal);
      if (request.signal.aborted) return;
      if (push) {
        const depth = new URL(location.href).searchParams.has('post') ? window.history.state?.workspaceDepth : 0;
        window.history.pushState({ workspaceDepth: typeof depth === 'number' ? depth + 1 : undefined }, '', homeUrl(id));
      }

      selectPreview(link);
      activePost = id;
      article.replaceChildren(document.importNode(entry.node, true));
      scrollArea.scrollTop = 0;
      document.title = entry.title;
      if (drawer) {
        drawer.open = false;
        for (const item of drawer.querySelectorAll<HTMLAnchorElement>('[data-post-id]')) {
          if (item.dataset.postId === id) item.setAttribute('aria-current', 'page');
          else item.removeAttribute('aria-current');
        }
      }
      if (edit) {
        edit.href = `/keystatic/collection/posts/item/${encodeURIComponent(id)}`;
        edit.textContent = 'Edit post';
      }
      animateMode(true, animate);
      article.querySelector<HTMLElement>('[data-article-title]')?.focus({ preventScroll: true });
      announce('');
    } catch {
      if (!request.signal.aborted) announce('The post could not load. Please try again.', true);
    } finally {
      if (pending === request) pending = undefined;
    }
  }

  function showHome() {
    pending?.abort();
    activePost = undefined;
    for (const media of article.querySelectorAll('audio, video')) media.pause();
    if (edit) {
      edit.href = '/keystatic/collection/posts/create';
      edit.textContent = 'New post';
    }
    document.title = homeTitle;
    animateMode(false, true);
    announce('');
  }

  function fromLocation() {
    const id = new URL(location.href).searchParams.get('post');
    if (id) void showPost(id, false);
    else showHome();
  }

  root.addEventListener('click', event => {
    if (event.button !== 0 || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest<HTMLAnchorElement>('a[data-post-id], a[data-workspace-home]');
    if (!link) return;

    event.preventDefault();
    if (link.hasAttribute('data-workspace-home')) {
      pending?.abort();
      const depth = window.history.state?.workspaceDepth;
      if (activePost && typeof depth === 'number' && depth > 0) window.history.go(-depth);
      else {
        window.history.replaceState(null, '', homeUrl());
        showHome();
      }
    } else if (link.hasAttribute('data-preview-post')) {
      pending?.abort();
      const title = selectPreview(link);
      if (stacked.matches) {
        title.focus({ preventScroll: true });
        preview.scrollIntoView({ block: 'nearest' });
      } else announce(`Previewing ${title.textContent}.`);
    } else if (link.dataset.postId) {
      void showPost(link.dataset.postId, true);
    }
  });

  window.addEventListener('popstate', fromLocation);
  const initialPost = new URL(location.href).searchParams.get('post');
  if (initialPost) void showPost(initialPost, false, false);
}
