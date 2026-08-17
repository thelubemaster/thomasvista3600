import { useMemo } from "react";
import * as THREE from "three";
import { Html } from "@react-three/drei";
import type { WorldPart, WorldWire, WireKind } from "@/data/world";
import { wireEnd } from "@/data/world";

export const WIRE_HEX: Record<WireKind, string> = {
  hot: "#d43c28",
  key: "#e09030",
  gnd: "#d8d4cc",
  sig: "#e6c44a",
};

const HOLE: Record<string, [number, number, number]> = {
  dash2: [-0.32, 0.78, 0],
  eng3: [0.18, 0.95, 0],
  front2b: [0.58, 0.62, 0],
};

function holeFor(w: WorldWire): [number, number, number] {
  if (["50", "85", "55", "18"].includes(w.circuit)) return HOLE.front2b;
  if (["97", "99", "98", "92"].includes(w.circuit)) return HOLE.eng3;
  return HOLE.dash2;
}

function offsetOf(id: string, span = 0.028) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return ((h % 7) - 3) * span;
}

function crosses(a: WorldPart, b: WorldPart) {
  const z = new Set([a.zone, b.zone]);
  return (z.has("cab") && z.has("eng")) || z.has("wall");
}

function waypoints(from: WorldPart, to: WorldPart, w: WorldWire): THREE.Vector3[] {
  const a = wireEnd(from, w.fromPin);
  const b = wireEnd(to, w.toPin);
  const ox = offsetOf(w.id);
  const pts: [number, number, number][] = [a];

  if (w.fat) {
    const railX = -0.88 + ox;
    pts.push([railX, 0.26, a[2]]);
    pts.push([railX, 0.26, b[2]]);
    pts.push(b);
    return pts.map((p) => new THREE.Vector3(...p));
  }

  if (crosses(from, to)) {
    const hole = holeFor(w);
    const hx = hole[0] + ox;
    const hy = hole[1] + offsetOf(w.id + "y", 0.012);
    const cab = from.zone === "cab" ? from : to.zone === "cab" ? to : null;
    const eng = from.zone === "eng" ? from : to.zone === "eng" ? to : null;
    const startCab = from.zone === "cab" || (from.zone === "wall" && to.zone === "eng");

    if (startCab) {
      if (cab) pts.push([cab.pos[0], 0.7, 0.42]);
      pts.push([hx, hy, 0.1]);
      pts.push([hx, hy, 0]);
      pts.push([hx, hy, -0.12]);
      if (eng) {
        pts.push([-0.82 + ox, 0.3, -0.45]);
        pts.push([-0.82 + ox, 0.3, eng.pos[2]]);
      }
    } else {
      if (eng) {
        pts.push([-0.82 + ox, 0.3, eng.pos[2]]);
        pts.push([-0.82 + ox, 0.3, -0.45]);
      }
      pts.push([hx, hy, -0.12]);
      pts.push([hx, hy, 0]);
      pts.push([hx, hy, 0.1]);
      if (cab) pts.push([cab.pos[0], 0.7, 0.42]);
    }
    pts.push(b);
    return pts.map((p) => new THREE.Vector3(...p));
  }

  if (from.zone === "cab" && to.zone === "cab") {
    pts.push([a[0], Math.min(a[1], b[1]) - 0.1, 1.02 + ox]);
    pts.push([b[0], Math.min(a[1], b[1]) - 0.1, 1.02 + ox]);
    pts.push(b);
    return pts.map((p) => new THREE.Vector3(...p));
  }

  if (from.zone === "eng" && to.zone === "eng") {
    pts.push([-0.82 + ox, 0.28, a[2]]);
    pts.push([-0.82 + ox, 0.28, b[2]]);
    pts.push(b);
    return pts.map((p) => new THREE.Vector3(...p));
  }

  pts.push([(a[0] + b[0]) / 2, Math.max(a[1], b[1]) - 0.06, (a[2] + b[2]) / 2]);
  pts.push(b);
  return pts.map((p) => new THREE.Vector3(...p));
}

export function Cable({
  from,
  to,
  wire,
  dim,
  focus,
  live = true,
  tag,
}: {
  from: WorldPart;
  to: WorldPart;
  wire: WorldWire;
  dim?: boolean;
  focus?: boolean;
  live?: boolean;
  tag?: string;
}) {
  const { geo, mid } = useMemo(() => {
    const pts = waypoints(from, to, wire);
    const curve = new THREE.CatmullRomCurve3(pts, false, "catmullrom", 0.15);
    const base = wire.fat ? 0.018 : wire.color === "hot" ? 0.01 : wire.color === "gnd" ? 0.011 : wire.color === "key" ? 0.008 : 0.0065;
    const r = focus ? base * 1.7 : base;
    return {
      geo: new THREE.TubeGeometry(curve, 28, r, 6, false),
      mid: curve.getPoint(0.52),
    };
  }, [from, to, wire, focus]);

  const dead = !live;
  const faded = dim || dead;

  return (
    <group>
      <mesh geometry={geo}>
        <meshBasicMaterial
          color={WIRE_HEX[wire.color]}
          transparent={faded}
          opacity={dead ? 0.08 : dim ? 0.14 : 1}
        />
      </mesh>
      {tag && (focus || (!dim && live)) ? (
        <Html position={mid} center distanceFactor={7} wrapperClass="shop-html" style={{ pointerEvents: "none" }}>
          <span className="rounded-xs border border-border bg-raised/90 px-1.5 py-0.5 font-mono text-[10px] text-fg">
            {tag}
          </span>
        </Html>
      ) : null}
    </group>
  );
}
