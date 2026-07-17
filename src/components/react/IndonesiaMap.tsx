import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useReducedMotion } from 'motion/react';
import * as THREE from 'three';

/**
 * On-brand 3D Indonesia coverage map (react-three-fiber).
 * Replaces the flat SVG archipelago. The camera is framed to the
 * archipelago bounds (not a whole Earth), so Sabang→Merauke reads clearly.
 * Single brand-blue accent + graphite; reduced-motion renders it static.
 */

// SVG viewBox 0 0 1411 520 — island polygons copied from the original map.
const ISLANDS: string[] = [
  '781.6,492.4 769,493 729.5,472.1 757.3,466.2 772.9,475.3 783.3,484.4 781.6,492.4',
  '892.4,489.4 866.9,496 863.3,492.4 866,482.3 878.8,464.1 908.3,452.3 911.3,458.2 911.9,467.2 892.4,489.4',
  '697.7,428.5 708.4,436.5 726.8,434 734.2,446.7 699.7,452.7 679.1,456.7 663.1,456.5 673.3,439.3 689.7,439.1 697.7,428.5',
  '846.7,428.5 842.4,445 797.6,453.5 758,449.8 757.9,438.9 781.5,432.7 800.2,441.7 820,439.4 846.7,428.5',
  '421.2,389.3 478.3,392.2 484.9,379.9 540.2,394.3 551,413.6 595.7,419 632.3,436.7 598.3,448.1 565.5,436.1 538.5,436.9 507.6,434.7 479.7,429.3 445.2,417.9 423.3,415 410.9,418.7 356.6,406.5 351.4,393.6 324.1,391.5 344.6,363 380.7,364.7 404.8,376.4 417.2,378.7 421.2,389.3',
  '1199,372.5 1183.7,392.8 1180.8,370.3 1186.1,359.6 1192.3,349.5 1199.1,358.3 1199,372.5',
  '976.2,290.4 965.1,300.3 944.5,294.8 938.7,282 968.8,280.5 976.2,290.4',
  '1072.3,279.5 1083.1,302.3 1057.9,290 1033,287.5 1016.2,289.5 995.6,288.4 1002.7,272 1039.5,270.8 1072.3,279.5',
  '1181.7,221.6 1190,269.8 1220.8,287.6 1245.7,256 1279.9,238.1 1306.4,238 1331.9,248.4 1354,259.1 1386,264.8 1386.5,361.9 1387,459 1360.5,434.5 1330.2,428.5 1322.9,437 1285.1,437.9 1297.8,413.7 1316.5,405.4 1308.8,373 1294.4,348 1236.7,322.8 1212.1,320.3 1167.4,292.7 1158.6,307.2 1147.1,309.8 1140.4,298.9 1140.3,286 1117.5,271.3 1149.6,260.6 1170.8,261.2 1168.4,253.3 1124.7,253.2 1112.9,235.5 1086.3,230 1073.7,215.2 1113.9,208 1129.1,198.3 1177,210.5 1181.7,221.6',
  '916.4,145 892.4,174.5 870,180.3 841.4,174.4 791.7,175.9 765.7,180.2 761.4,202.8 788.1,229.3 804.2,215.8 859.8,205.6 857.3,219.4 844.3,215 831.4,232.5 805.2,244 833.4,282.2 827.9,292.5 854.7,326.9 854.5,346.4 838.6,355.2 826.9,344.7 841.3,320.3 812,331.9 804.6,323.6 808.5,312.1 787,294.6 789.2,265.6 769.3,274.6 771.8,309.4 773.1,352 754.2,356.3 741.4,347.6 749.9,320.2 745.3,291.4 732.8,291.2 723.5,270.8 735.8,251.3 740.1,227.6 755,182.7 761.3,170.4 786.6,148.3 809.9,157.1 847.5,161.2 881.7,160 911.2,138.3 916.4,145',
  '1019.1,153.5 1017.6,179.6 1002.2,176.7 997.7,194.8 1009.9,210.5 1001.6,214.1 989.6,195.2 980.7,157.1 986.7,133.3 996.6,122.5 998.7,138.8 1016.3,141.4 1019.1,153.5',
  '696.9,132.8 730.3,160.4 695,163.9 685.1,184.2 686.4,211.2 657.7,231.6 656.9,261.3 645.4,306.9 641.1,296.3 607.2,309.7 595.4,291.5 574.2,289.8 559.3,280.2 523.9,290.9 513,276.5 493.5,278.2 468.9,274.7 464.4,234.8 449.5,226.5 435.2,201 431,174.9 434.5,147.3 452.2,127.5 457.2,147.4 477.6,164.3 496.8,158.2 515.8,160.3 533.2,145.3 547.5,142.7 575.7,151 600,144.7 615.2,103.2 626.7,92.9 637,59 671.3,59 697.1,64 680.2,90.9 702.1,119.1 696.9,132.8',
  '337.6,361.7 304.6,362.3 279.5,337.4 241.3,313 228.5,295 206,270.7 191.2,248.4 168.5,206.7 142.3,181.8 133.6,156.2 122.6,133 95.7,114.2 80.1,88.7 57.7,72 26.6,39.2 24,24 43.2,25.2 89.3,31 115.7,60.1 138.7,80.3 155.1,92.7 183.4,124.7 213.7,125.2 238.7,145.6 255.9,170.6 278.6,184.2 266.7,208.5 283.8,218.9 294.5,219.6 299.5,240.4 309.9,257 331.8,259.7 346.3,278.5 338.8,315.6 337.6,361.7',
];

// City markers (SVG coords) — major BSM delivery hubs.
const CITIES: [number, number, number][] = [
  [544.2, 403.3, 6.5], [543.3, 409.3, 6.5], [540.6, 400.6, 6.5], [540.6, 425.1, 6.5],
  [368.4, 372, 6.5], [475.1, 395, 6.5], [473, 419.7, 6.5], [391.3, 392.9, 6.5],
  [581.4, 232, 7.5], [775.1, 276.7, 7.5], [1371.1, 321.4, 7.5], [194.1, 202.2, 7.5],
];

// Sabang → Merauke travel path (SVG coords).
const PATH: [number, number][] = [
  [194.1, 202.2], [368.4, 372], [475.1, 395], [544.2, 403.3], [581.4, 232],
  [775.1, 276.7], [976.2, 290.4], [1072.3, 279.5], [1181.7, 221.6], [1371.1, 321.4],
];

const VB_W = 1411;
const VB_H = 520;
const SCALE = 0.0098; // fits width ~13.8 units

function to3D(x: number, y: number): [number, number] {
  return [(x - VB_W / 2) * SCALE, (VB_H / 2 - y) * SCALE];
}

function polygonToShape(pts: string): THREE.Shape {
  const shape = new THREE.Shape();
  pts.trim().split(/\s+/).forEach((pair, i) => {
    const [x, y] = pair.split(',').map(Number);
    const [px, py] = to3D(x, y);
    if (i === 0) shape.moveTo(px, py);
    else shape.lineTo(px, py);
  });
  return shape;
}

function Archipelago({ animate }: { animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const shapes = useMemo(() => ISLANDS.map(polygonToShape), []);

  useFrame((state, delta) => {
    if (!group.current) return;
    if (animate) {
      // Gentle tilt oscillation + pointer parallax — NOT a full spin
      // (a flat extruded archipelago turns edge-on and vanishes if spun).
      const t = state.clock.elapsedTime;
      group.current.rotation.y = Math.sin(t * 0.25) * 0.18;
      const { x, y } = state.pointer;
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, 0.35 + y * 0.1, 0.05);
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, x * 0.3, 0.05);
    }
  });

  return (
    <group ref={group} rotation={[0.35, 0, 0]}>
      {shapes.map((shape, i) => {
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: false });
        geo.computeVertexNormals();
        return (
          <mesh key={i} geometry={geo}>
            <meshStandardMaterial
              color="#2f5d8a"
              transparent
              opacity={0.5}
              roughness={0.55}
              metalness={0.15}
            />
          </mesh>
        );
      })}
      {/* outline edges for a crisp, flat look */}
      {shapes.map((shape, i) => {
        const geo = new THREE.ExtrudeGeometry(shape, { depth: 0.25, bevelEnabled: false });
        return (
          <lineSegments key={`e${i}`}>
            <edgesGeometry args={[geo]} />
            <lineBasicMaterial color="#1f3f5f" transparent opacity={0.9} />
          </lineSegments>
        );
      })}
      {/* city markers */}
      {CITIES.map(([x, y, r], i) => {
        const [px, py] = to3D(x, y);
        return (
          <mesh key={`c${i}`} position={[px, py, 0.35]}>
            <circleGeometry args={[r * SCALE * 2.0, 24]} />
            <meshBasicMaterial color="#2f5d8a" />
          </mesh>
        );
      })}
      {/* travel path */}
      <TravelPath animate={animate} />
    </group>
  );
}

function TravelPath({ animate }: { animate: boolean }) {
  const dot = useRef<THREE.Mesh>(null);
  const curve = useMemo(() => {
    const v = PATH.map(([x, y]) => {
      const [px, py] = to3D(x, y);
      return new THREE.Vector3(px, py, 0.35);
    });
    return new THREE.CatmullRomCurve3(v);
  }, []);

  useFrame((state) => {
    if (!dot.current || !animate) return;
    const t = (state.clock.elapsedTime % 4) / 4;
    const p = curve.getPointAt(t);
    dot.current.position.copy(p);
  });

  const pts = useMemo(() => curve.getPoints(80), [curve]);

  return (
    <group>
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array(pts.flatMap((p) => [p.x, p.y, p.z])), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#1f3f5f" transparent opacity={0.5} />
      </line>
      <mesh ref={dot} position={[0, 0, 0.35]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial color="#2f5d8a" />
      </mesh>
    </group>
  );
}

export default function IndonesiaMap() {
  const reduce = useReducedMotion();
  const animate = !reduce;

  return (
    <div
      role="img"
      aria-label="Peta 3D jangkauan pengiriman BSM di seluruh Indonesia, dari Sabang sampai Merauke"
      style={{ width: '100%', aspectRatio: '1411 / 520' }}
    >
      <Canvas
        camera={{ position: [0, 0, 9], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={1.15} />
        <directionalLight position={[3, 5, 6]} intensity={0.7} />
        <Archipelago animate={animate} />
      </Canvas>
    </div>
  );
}
