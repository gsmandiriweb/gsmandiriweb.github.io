import { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';

/**
 * Ambient background — a faint brushed-steel wireframe field.
 * One global R3F canvas behind all page content. Replaces the
 * raster "generated" decorative textures with a single, continuous,
 * classy 3D motif that reads as structural steel linework.
 *
 * Uses drei <Line> for true pixel-width strokes (THREE.Line is
 * locked to 1px in WebGL and vanished against white).
 * Edge-faded via mask-image; reduced-motion renders it static.
 * Single WebGL context for the whole site.
 */

// Tiny seeded PRNG so the field is deterministic.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Seg = { points: [number, number, number][]; color: string; width: number; opacity: number };

function buildSegments(): Seg[] {
  const rng = mulberry32(20240718);
  const N = 260;
  const span = 30;
  const out: Seg[] = [];

  for (let i = 0; i < N; i++) {
    const x = (rng() - 0.5) * span;
    const y = (rng() - 0.5) * span;
    const z = (rng() - 0.5) * 10 - 4;
    const len = 0.8 + rng() * 2.6;
    const horiz = rng() > 0.5;
    const isAccent = rng() > 0.9;
    const a: [number, number, number] = [x, y, z];
    const b: [number, number, number] = horiz
      ? [x + len, y + (rng() - 0.5) * 0.22, z]
      : [x + (rng() - 0.5) * 0.22, y + len, z];
    out.push({
      points: [a, b],
      color: isAccent ? '#e22b1e' : '#8a93a0',
      width: isAccent ? 2.2 : 1.3,
      opacity: isAccent ? 0.85 : 0.5,
    });
  }

  // A few larger faint quadrilateral "panels" for depth.
  for (let i = 0; i < 12; i++) {
    const x = (rng() - 0.5) * span;
    const y = (rng() - 0.5) * span;
    const z = (rng() - 0.5) * 6 - 7;
    const w = 2.2 + rng() * 3.2;
    const h = 1.6 + rng() * 2.6;
    const c1: [number, number, number] = [x - w / 2, y - h / 2, z];
    const c2: [number, number, number] = [x + w / 2, y - h / 2, z];
    const c3: [number, number, number] = [x + w / 2, y + h / 2, z];
    const c4: [number, number, number] = [x - w / 2, y + h / 2, z];
    out.push({ points: [c1, c2], color: '#9aa3ad', width: 1, opacity: 0.22 });
    out.push({ points: [c2, c3], color: '#9aa3ad', width: 1, opacity: 0.22 });
    out.push({ points: [c3, c4], color: '#9aa3ad', width: 1, opacity: 0.22 });
    out.push({ points: [c4, c1], color: '#9aa3ad', width: 1, opacity: 0.22 });
  }

  return out;
}

function Field({ animate }: { animate: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const segs = useMemo(() => buildSegments(), []);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!ref.current) return;
    if (animate) {
      const t = state.clock.elapsedTime;
      ref.current.rotation.y = Math.sin(t * 0.04) * 0.1;
      ref.current.rotation.x = Math.sin(t * 0.03) * 0.05;
      ref.current.position.x = THREE.MathUtils.lerp(ref.current.position.x, pointer.x * 0.7, 0.03);
      ref.current.position.y = THREE.MathUtils.lerp(ref.current.position.y, pointer.y * 0.45, 0.03);
    }
  });

  return (
    <group ref={ref} position={[0, 0, -6]}>
      {segs.map((s, i) => (
        <Line
          key={i}
          points={s.points}
          color={s.color}
          lineWidth={s.width}
          transparent
          opacity={s.opacity}
          depthWrite={false}
        />
      ))}
    </group>
  );
}

export default function Background3D() {
  const reduce = useReducedMotion();
  const animate = !reduce;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        WebkitMaskImage:
          'radial-gradient(135% 120% at 50% 46%, #000 35%, transparent 100%)',
        maskImage:
          'radial-gradient(135% 120% at 50% 46%, #000 35%, transparent 100%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 13], fov: 42 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Field animate={animate} />
      </Canvas>
    </div>
  );
}
