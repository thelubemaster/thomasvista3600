import type { FlowNode } from "@/data/schematics";

const BOX_W = 128;
const BOX_H = 56;
const PAD = 20;
const STUB = 18;

type Pt = { x: number; y: number };
type Side = "L" | "R" | "T" | "B";
type Box = { id: string; l: number; r: number; t: number; b: number };

function boxOf(n: FlowNode): Box {
  return { id: n.id, l: n.x - BOX_W / 2, r: n.x + BOX_W / 2, t: n.y - BOX_H / 2, b: n.y + BOX_H / 2 };
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

const FACE = 24;

function port(n: FlowNode, side: Side, lane: number): Pt {
  const l = clamp(lane, -FACE, FACE);
  if (side === "R") return { x: n.x + BOX_W / 2, y: n.y + l };
  if (side === "L") return { x: n.x - BOX_W / 2, y: n.y + l };
  if (side === "T") return { x: n.x + l, y: n.y - BOX_H / 2 };
  return { x: n.x + l, y: n.y + BOX_H / 2 };
}

export type WireEnd = { id: string; from: string; to: string; circuit: string; label?: string };
export type WireLane = { fromLane: number; toLane: number };

function endKey(w: WireEnd, end: "from" | "to"): string {
  const lab = (w.label || "").trim();
  const parts = lab.split(/\s*→\s*/);
  if (parts.length === 2) {
    const bit = (end === "from" ? parts[0] : parts[1]).trim();
    if (bit) return bit.toUpperCase();
  }
  if (lab && parts.length === 1 && end === "to") return lab.toUpperCase();
  return w.circuit.toUpperCase();
}

function slotsFor(count: number): number[] {
  if (count <= 1) return [0];
  const step = Math.min(14, (2 * FACE) / (count - 1));
  return Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * step);
}

/** Distinct face offsets per cavity at each box. Same cavity may share a port. */
export function wireLanes(wires: WireEnd[]): Map<string, WireLane> {
  const atNode = new Map<string, { wireId: string; key: string; end: "from" | "to" }[]>();
  for (const w of wires) {
    const add = (node: string, end: "from" | "to") => {
      const list = atNode.get(node) ?? [];
      list.push({ wireId: w.id, key: endKey(w, end), end });
      atNode.set(node, list);
    };
    add(w.from, "from");
    add(w.to, "to");
  }
  const out = new Map<string, WireLane>();
  const ensure = (id: string) => {
    const cur = out.get(id) ?? { fromLane: 0, toLane: 0 };
    out.set(id, cur);
    return cur;
  };
  for (const list of atNode.values()) {
    const keys = [...new Set(list.map((x) => x.key))].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    const slots = slotsFor(keys.length);
    const slotOf = new Map(keys.map((k, i) => [k, slots[i]]));
    for (const item of list) {
      const lane = slotOf.get(item.key) ?? 0;
      const rec = ensure(item.wireId);
      if (item.end === "from") rec.fromLane = lane;
      else rec.toLane = lane;
    }
  }
  return out;
}

function almost(a: number, b: number) {
  return Math.abs(a - b) < 0.75;
}

function segHits(a: Pt, b: Pt, obstacles: Box[]): boolean {
  const xmin = Math.min(a.x, b.x);
  const xmax = Math.max(a.x, b.x);
  const ymin = Math.min(a.y, b.y);
  const ymax = Math.max(a.y, b.y);
  const vertical = almost(a.x, b.x);
  for (const o of obstacles) {
    const L = o.l - PAD;
    const R = o.r + PAD;
    const T = o.t - PAD;
    const B = o.b + PAD;
    if (vertical) {
      if (a.x >= L && a.x <= R && ymax >= T && ymin <= B) return true;
    } else if (a.y >= T && a.y <= B && xmax >= L && xmin <= R) {
      return true;
    }
  }
  return false;
}

function pathHits(pts: Pt[], obstacles: Box[]): boolean {
  for (let i = 0; i < pts.length - 1; i++) {
    if (segHits(pts[i], pts[i + 1], obstacles)) return true;
  }
  return false;
}

/** How many times a path runs along a box face (looks like it lands there). */
function skirts(pts: Pt[], obstacles: Box[], near = 26): number {
  let n = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const xmin = Math.min(a.x, b.x);
    const xmax = Math.max(a.x, b.x);
    const ymin = Math.min(a.y, b.y);
    const ymax = Math.max(a.y, b.y);
    const vertical = almost(a.x, b.x);
    for (const o of obstacles) {
      if (vertical) {
        const along = ymax > o.t + 4 && ymin < o.b - 4;
        const close = a.x >= o.l - near && a.x <= o.r + near;
        if (along && close) n += 1;
      } else {
        const along = xmax > o.l + 4 && xmin < o.r - 4;
        const close = a.y >= o.t - near && a.y <= o.b + near;
        if (along && close) n += 1;
      }
    }
  }
  return n;
}

export function pathLen(pts: Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    s += Math.abs(pts[i + 1].x - pts[i].x) + Math.abs(pts[i + 1].y - pts[i].y);
  }
  return s;
}

function uniqueNums(xs: number[]): number[] {
  const out: number[] = [];
  for (const x of xs) {
    if (!out.some((y) => almost(y, x))) out.push(x);
  }
  return out;
}

function hvh(p1: Pt, p2: Pt, mx: number): Pt[] {
  if (almost(p1.y, p2.y)) return [p1, p2];
  return [p1, { x: mx, y: p1.y }, { x: mx, y: p2.y }, p2];
}

function vhv(p1: Pt, p2: Pt, my: number): Pt[] {
  if (almost(p1.x, p2.x)) return [p1, p2];
  return [p1, { x: p1.x, y: my }, { x: p2.x, y: my }, p2];
}

function preferredSides(a: FlowNode, b: FlowNode): [Side, Side][] {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const out: [Side, Side][] = [];
  if (Math.abs(dx) >= BOX_W * 0.35) out.push(dx >= 0 ? ["R", "L"] : ["L", "R"]);
  if (Math.abs(dy) >= BOX_H * 0.35) out.push(dy >= 0 ? ["B", "T"] : ["T", "B"]);
  if (!out.length) out.push(dx >= 0 ? ["R", "L"] : ["L", "R"]);
  return out;
}

function simplify(pts: Pt[]): Pt[] {
  const out: Pt[] = [];
  for (const p of pts) {
    const last = out[out.length - 1];
    if (last && almost(last.x, p.x) && almost(last.y, p.y)) continue;
    const prev = out[out.length - 2];
    if (prev && last && ((almost(prev.x, last.x) && almost(last.x, p.x)) || (almost(prev.y, last.y) && almost(last.y, p.y)))) {
      out[out.length - 1] = p;
      continue;
    }
    out.push(p);
  }
  return out;
}

export function polylineToPath(pts: Pt[], radius = 8): string {
  const p = simplify(pts);
  if (p.length < 2) return "";
  if (p.length === 2) return `M ${p[0].x} ${p[0].y} L ${p[1].x} ${p[1].y}`;
  let d = `M ${p[0].x} ${p[0].y}`;
  for (let i = 1; i < p.length - 1; i++) {
    const prev = p[i - 1];
    const cur = p[i];
    const next = p[i + 1];
    const inLen = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const outLen = Math.hypot(next.x - cur.x, next.y - cur.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);
    const ix = inLen ? (cur.x - prev.x) / inLen : 0;
    const iy = inLen ? (cur.y - prev.y) / inLen : 0;
    const ox = outLen ? (next.x - cur.x) / outLen : 0;
    const oy = outLen ? (next.y - cur.y) / outLen : 0;
    d += ` L ${cur.x - ix * r} ${cur.y - iy * r} Q ${cur.x} ${cur.y} ${cur.x + ox * r} ${cur.y + oy * r}`;
  }
  const last = p[p.length - 1];
  d += ` L ${last.x} ${last.y}`;
  return d;
}

export function pathMid(pts: Pt[]): Pt {
  const total = pathLen(pts);
  if (total < 1) return pts[0] ?? { x: 0, y: 0 };
  let remain = total / 2;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const len = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    if (remain <= len) {
      const t = len ? remain / len : 0;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    remain -= len;
  }
  return pts[pts.length - 1] ?? { x: 0, y: 0 };
}

export function routeWire(
  from: FlowNode,
  to: FlowNode,
  nodes: FlowNode[],
  lane: number | WireLane = 0,
  bounds?: { w: number; h: number },
): string {
  return polylineToPath(routeWirePts(from, to, nodes, lane, bounds));
}

export function routeWirePts(
  from: FlowNode,
  to: FlowNode,
  nodes: FlowNode[],
  lane: number | WireLane = 0,
  bounds?: { w: number; h: number },
): Pt[] {
  const fromLane = typeof lane === "number" ? lane : lane.fromLane;
  const toLane = typeof lane === "number" ? -lane : lane.toLane;
  const obstacles = nodes.filter((n) => n.id !== from.id && n.id !== to.id).map(boxOf);
  const W = bounds?.w ?? 1600;
  const H = bounds?.h ?? 800;
  const pairs = preferredSides(from, to);
  const extras: [Side, Side][] = [
    ["R", "L"],
    ["L", "R"],
    ["B", "T"],
    ["T", "B"],
    ["R", "T"],
    ["R", "B"],
    ["L", "T"],
    ["L", "B"],
    ["T", "L"],
    ["T", "R"],
    ["B", "L"],
    ["B", "R"],
  ];
  const seen = new Set<string>();
  const sides: [Side, Side][] = [];
  for (const pair of [...pairs, ...extras]) {
    const key = pair.join("");
    if (seen.has(key)) continue;
    seen.add(key);
    sides.push(pair);
  }

  const cands: Pt[][] = [];
  const xs = uniqueNums([
    ...obstacles.flatMap((o) => [o.l - PAD, o.r + PAD]),
    Math.min(from.x, to.x) - BOX_W / 2 - 36,
    Math.max(from.x, to.x) + BOX_W / 2 + 36,
    (from.x + to.x) / 2,
  ]).map((x) => clamp(x, 10, W - 10));
  const ys = uniqueNums([
    ...obstacles.flatMap((o) => [o.t - PAD, o.b + PAD]),
    Math.min(from.y, to.y) - BOX_H / 2 - 28,
    Math.max(from.y, to.y) + BOX_H / 2 + 28,
    (from.y + to.y) / 2,
  ]).map((y) => clamp(y, 10, H - 10));

  for (const [sa, sb] of sides) {
    const p1 = port(from, sa, fromLane);
    const p2 = port(to, sb, toLane);
    if (sa === "R" || sa === "L") {
      const stubX = clamp(p1.x + (sa === "R" ? STUB : -STUB), 10, W - 10);
      for (const mx of uniqueNums([stubX, p2.x + (sb === "L" ? -STUB : sb === "R" ? STUB : 0), ...xs].map((x) => x + fromLane))) {
        cands.push(hvh(p1, p2, clamp(mx, 10, W - 10)));
      }
    }
    if (sa === "T" || sa === "B") {
      const stubY = clamp(p1.y + (sa === "B" ? STUB : -STUB), 10, H - 10);
      for (const my of uniqueNums([stubY, p2.y + (sb === "T" ? -STUB : sb === "B" ? STUB : 0), ...ys].map((y) => y + fromLane))) {
        cands.push(vhv(p1, p2, clamp(my, 10, H - 10)));
      }
    }
    const top = clamp(Math.min(from.y, to.y) - BOX_H / 2 - 26 - Math.abs(fromLane), 10, H - 10);
    const bot = clamp(Math.max(from.y, to.y) + BOX_H / 2 + 26 + Math.abs(fromLane), 10, H - 10);
    const left = clamp(Math.min(from.x, to.x) - BOX_W / 2 - 30 - Math.abs(fromLane), 10, W - 10);
    const right = clamp(Math.max(from.x, to.x) + BOX_W / 2 + 30 + Math.abs(fromLane), 10, W - 10);
    cands.push([p1, { x: p1.x, y: top }, { x: p2.x, y: top }, p2]);
    cands.push([p1, { x: p1.x, y: bot }, { x: p2.x, y: bot }, p2]);
    cands.push([p1, { x: left, y: p1.y }, { x: left, y: p2.y }, p2]);
    cands.push([p1, { x: right, y: p1.y }, { x: right, y: p2.y }, p2]);
  }

  let best: Pt[] | null = null;
  let bestScore = Infinity;
  let fallback: Pt[] = cands[0] ?? [port(from, "R", fromLane), port(to, "L", toLane)];
  let fallbackLen = Infinity;
  for (const raw of cands) {
    const pts = simplify(raw);
    if (pts.length < 2) continue;
    const len = pathLen(pts);
    if (len < fallbackLen) {
      fallback = pts;
      fallbackLen = len;
    }
    if (pathHits(pts, obstacles)) continue;
    const score = len + skirts(pts, obstacles) * 90;
    if (score < bestScore) {
      best = pts;
      bestScore = score;
    }
  }
  return best ?? fallback;
}
