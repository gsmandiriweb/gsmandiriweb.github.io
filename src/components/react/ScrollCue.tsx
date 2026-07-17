import { motion, useReducedMotion } from 'motion/react';

/**
 * Hero scroll cue — a brand-blue animated chevron that invites scrolling.
 * Purely decorative (no content depends on it), so it complies with the
 * DESIGN.md rule that motion must never gate content visibility.
 * Single accent, sharp geometry, reduced-motion safe.
 */
export default function ScrollCue({ label = 'Gulir' }: { label?: string }) {
  const reduce = useReducedMotion();

  return (
    <motion.a
      href="#produk"
      aria-label="Gulir ke produk"
      className="scroll-cue"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.9 }}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        textDecoration: 'none',
        color: 'var(--muted)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.78rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}
    >
      <span>{label}</span>
      <span
        style={{
          position: 'relative',
          width: 26,
          height: 42,
          border: '2px solid var(--border-strong)',
          borderRadius: 14,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <motion.span
          aria-hidden="true"
          style={{
            width: 4,
            height: 8,
            borderRadius: 2,
            background: 'var(--accent)',
          }}
          animate={reduce ? { y: 0 } : { y: [0, 12, 0] }}
          transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
      </span>
    </motion.a>
  );
}
