import { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue, useReducedMotion } from 'motion/react';

/**
 * Brand-red scroll progress line driven by a motion spring.
 * Replaces the CSS-only `.scroll-progress` bar in Base.astro.
 * On-brand: single red accent, no second color, reduced-motion safe.
 */
export default function ScrollProgress() {
  const reduce = useReducedMotion();
  const [progress, setProgress] = useState(0);
  const scaleX = useSpring(0, { stiffness: 140, damping: 26, restDelta: 0.001 });
  const complete = useMotionValue(0);

  // Track scroll position.
  useEffect(() => {
    const update = () => {
      const el = document.scrollingElement || document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      const p = max > 0 ? el.scrollTop / max : 0;
      setProgress(p);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  // Drive the spring + "complete" glow from the progress value.
  useEffect(() => {
    scaleX.set(progress);
    complete.set(progress > 0.98 ? 1 : 0);
  }, [progress, scaleX, complete]);

  if (reduce) {
    // No spring animation; static, graded bar that still reflects scroll position.
    return (
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          bottom: -1,
          width: '100%',
          height: 2,
          transformOrigin: '0 50%',
          transform: `scaleX(${progress})`,
          background: 'linear-gradient(90deg, #b91c12, #e22b1e)',
        }}
      />
    );
  }

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'absolute',
        left: 0,
        bottom: -1,
        width: '100%',
        height: 2,
        transformOrigin: '0 50%',
        scaleX,
        background: 'linear-gradient(90deg, #b91c12, #e22b1e)',
        boxShadow: '0 0 8px oklch(50% 0.12 25 / 0.35)',
      }}
      animate={{
        boxShadow:
          complete.get() === 1
            ? '0 0 12px oklch(50% 0.12 25 / 0.5), 0 0 24px oklch(50% 0.12 25 / 0.2)'
            : '0 0 8px oklch(50% 0.12 25 / 0.35)',
      }}
    />
  );
}
