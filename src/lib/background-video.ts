const fadeSeconds = 0.5;
const loopDelay = 100;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function mountVideo(video: HTMLVideoElement) {
  const playlist: { id: string; src: string }[] = JSON.parse(video.dataset.playlist ?? '[]');
  const backdrop = video.parentElement;
  let index = 0;
  let frame = 0;
  let replay = 0;
  let consecutiveFailures = 0;
  let blocked = false;

  const shouldPlay = () => !blocked && consecutiveFailures < playlist.length &&
    !reducedMotion.matches && !document.hidden;

  function paint() {
    frame = 0;
    const elapsed = video.currentTime;
    const remaining = video.duration - elapsed;
    const opacity = Math.max(0, Math.min(1, elapsed / fadeSeconds, remaining / fadeSeconds));
    video.style.opacity = Number.isFinite(opacity) ? String(opacity) : '0';
    if (!video.paused && !video.ended) frame = requestAnimationFrame(paint);
  }

  function play() {
    if (!shouldPlay() || replay) return;

    const clip = playlist[index];
    if (video.getAttribute('src') !== clip.src) {
      if (backdrop) backdrop.dataset.clip = clip.id;
      video.src = clip.src;
    } else if (!video.paused && !video.ended) return;

    void video.play().catch((error: DOMException) => {
      // Source errors are handled by the media error event.
      if (error.name === 'AbortError' || video.error || clip !== playlist[index]) return;
      if (error.name === 'NotAllowedError') {
        blocked = true;
        synchronize();
      } else {
        advance(true);
      }
    });
  }

  function synchronize() {
    const paused = !shouldPlay();
    if (video.hasAttribute('data-motion-paused') !== paused) {
      video.toggleAttribute('data-motion-paused', paused);
      document.dispatchEvent(new Event('workspace:motion-change'));
    }
    if (paused) {
      clearTimeout(replay);
      replay = 0;
      video.pause();
      if (reducedMotion.matches) video.style.opacity = '0';
    } else play();
  }

  function advance(failed = false) {
    video.style.opacity = '0';
    if (failed) consecutiveFailures++;
    index = (index + 1) % playlist.length;
    if (shouldPlay()) {
      replay = window.setTimeout(() => {
        replay = 0;
        play();
      }, loopDelay);
    } else synchronize();
  }

  video.addEventListener('playing', () => {
    consecutiveFailures = 0;
    if (!frame) frame = requestAnimationFrame(paint);
  });
  video.addEventListener('pause', () => {
    cancelAnimationFrame(frame);
    frame = 0;
  });
  video.addEventListener('ended', () => advance());
  video.addEventListener('error', () => advance(true));
  reducedMotion.addEventListener('change', synchronize);
  document.addEventListener('visibilitychange', synchronize);
  synchronize();
}

const video = document.querySelector<HTMLVideoElement>('[data-background-video]');
if (video) mountVideo(video);
