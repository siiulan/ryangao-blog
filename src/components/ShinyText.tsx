import { useEffect } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useAnimate } from 'framer-motion/mini';

export default function ShinyText({ children }: { children: string }) {
  const [text, animate] = useAnimate<HTMLSpanElement>();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!text.current || reduceMotion) return;

    const shine = animate(text.current, {
      backgroundPosition: ['100% 50%', '0% 50%'],
    }, {
      duration: 3,
      ease: 'linear',
      repeat: Infinity,
    });
    const syncMotion = () => {
      if (document.querySelector('[data-background-video][data-motion-paused]')) shine.pause();
      else shine.play();
    };

    document.addEventListener('workspace:motion-change', syncMotion);
    syncMotion();
    return () => {
      document.removeEventListener('workspace:motion-change', syncMotion);
      shine.stop();
    };
  }, [animate, reduceMotion, text]);

  return <span ref={text} className="hero-shine">{children}</span>;
}
