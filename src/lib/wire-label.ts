export type Pt = { x: number; y: number };

function pathLen(pts: Pt[]): number {
  let s = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    s += Math.abs(pts[i + 1].x - pts[i].x) + Math.abs(pts[i + 1].y - pts[i].y);
  }
  return s;
}
export type LabelBox = { l: number; r: number; t: number; b: number };

export type WireLabelIn = {
  id: string;
  pts: Pt[];
  circuit: string;
  note: string | null;
};

export type WireLabel = {
  id: string;
  circuit: string;
  note: string | null;
  attach: Pt;
  textAt: Pt;
  box: LabelBox;
  leaderTo: Pt;
};

const GAP = 3;

export function measureTag(circuit: string, note: string | null): { w: number; h: number } {
  const cW = Math.max(22, circuit.length * 7 + 12);
  const nW = note ? note.length * 5.6 + 12 : 0;
  return { w: Math.max(cW, nW), h: note ? 26 : 15 };
}

function boxAt(c: Pt, w: number, h: number): LabelBox {
  return { l: c.x - w / 2, r: c.x + w / 2, t: c.y - h / 2, b: c.y + h / 2 };
}

function boxesHit(a: LabelBox, b: LabelBox, gap = GAP) {
  return a.l < b.r + gap && a.r + gap > b.l && a.t < b.b + gap && a.b + gap > b.t;
}

function inBounds(b: LabelBox, w: number, h: number, pad = 4) {
  return b.l >= pad && b.t >= pad && b.r <= w - pad && b.b <= h - pad;
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function almost(a: number, b: number) {
  return Math.abs(a - b) < 0.75;
}

function leaderToPill(attach: Pt, center: Pt, box: LabelBox): Pt {
  const dx = center.x - attach.x;
  const dy = center.y - attach.y;
  if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) return center;
  const hw = (box.r - box.l) / 2;
  const hh = (box.b - box.t) / 2;
  const sx = hw > 0 ? hw / Math.abs(dx) : Infinity;
  const sy = hh > 0 ? hh / Math.abs(dy) : Infinity;
  const t = Math.min(sx, sy);
  return { x: center.x - dx * t, y: center.y - dy * t };
}

function atLength(pts: Pt[], s: number): { p: Pt; tx: number; ty: number } | null {
  if (pts.length < 2) return null;
  let remain = Math.max(0, s);
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const len = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    if (remain <= len || i === pts.length - 2) {
      const t = len ? clamp(remain / len, 0, 1) : 0;
      const p = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
      const eu = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      return { p, tx: (b.x - a.x) / eu, ty: (b.y - a.y) / eu };
    }
    remain -= len;
  }
  return null;
}

function runs(pts: Pt[]): { fromS: number; toS: number; len: number }[] {
  const out: { fromS: number; toS: number; len: number }[] = [];
  let fromS = 0;
  let acc = 0;
  let s = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    const len = Math.abs(b.x - a.x) + Math.abs(b.y - a.y);
    if (acc === 0) fromS = s;
    acc += len;
    s += len;
    const next = pts[i + 2];
    const horiz = almost(a.y, b.y);
    const continues = Boolean(next && ((horiz && almost(b.y, next.y)) || (!horiz && almost(b.x, next.x))));
    if (!continues) {
      out.push({ fromS, toS: s, len: acc });
      acc = 0;
    }
  }
  out.sort((a, b) => b.len - a.len);
  return out;
}

function dist2(a: Pt, b: Pt) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

function obstacleHits(box: LabelBox, obstacles: LabelBox[]) {
  let n = 0;
  for (const o of obstacles) if (boxesHit(box, o, 2)) n += 1;
  return n;
}

function bundleKey(pts: Pt[]): string {
  const a = pts[0];
  const b = pts[pts.length - 1];
  if (!a || !b) return "";
  const x0 = Math.round(Math.min(a.x, b.x) / 16);
  const x1 = Math.round(Math.max(a.x, b.x) / 16);
  const y0 = Math.round(Math.min(a.y, b.y) / 16);
  const y1 = Math.round(Math.max(a.y, b.y) / 16);
  return `${x0},${y0}-${x1},${y1}`;
}

export function placeWireLabels(
  wires: WireLabelIn[],
  obstacles: LabelBox[],
  bounds: { w: number; h: number },
): WireLabel[] {
  const groups = new Map<string, number[]>();
  wires.forEach((w, i) => {
    const k = bundleKey(w.pts);
    const list = groups.get(k) ?? [];
    list.push(i);
    groups.set(k, list);
  });
  const bundlePos = new Map<string, { i: number; n: number }>();
  for (const list of groups.values()) {
    list.forEach((idx, i) => bundlePos.set(wires[idx].id, { i, n: list.length }));
  }

  const order = wires
    .map((w, i) => ({ i, len: pathLen(w.pts) }))
    .sort((a, b) => b.len - a.len)
    .map((x) => x.i);

  const placed: WireLabel[] = [];
  const placedAt: WireLabel[] = [];

  for (const idx of order) {
    const w = wires[idx];
    const size = measureTag(w.circuit, w.note);
    const total = pathLen(w.pts);
    if (total < 8 || w.pts.length < 2) continue;

    const bun = bundlePos.get(w.id) ?? { i: 0, n: 1 };
    const tSpread =
      bun.n > 1 ? 0.28 + (bun.i / Math.max(1, bun.n - 1)) * 0.44 : 0.5;
    const sidePref = bun.i % 2 === 0 ? 1 : -1;

    const cands: { score: number; lab: WireLabel }[] = [];
    const runList = runs(w.pts);
    const samples: number[] = [];
    if (runList.length) {
      for (const run of runList.slice(0, 3)) {
        const inset = Math.min(18, run.len * 0.18);
        const usable = Math.max(0, run.len - inset * 2);
        const ts = bun.n > 1 ? [tSpread, 0.5, 1 - tSpread, 0.22, 0.78] : [0.5, 0.35, 0.65, 0.22, 0.78];
        for (const t of ts) samples.push(run.fromS + inset + usable * t);
      }
    }
    samples.push(total * tSpread, total * 0.5, total * 0.33, total * 0.67);
    const uniq: number[] = [];
    for (const s of samples) {
      const v = clamp(s, 10, total - 10);
      if (!uniq.some((u) => Math.abs(u - v) < 4)) uniq.push(v);
    }

    for (const s of uniq) {
      const hit = atLength(w.pts, s);
      if (!hit) continue;
      let nx = -hit.ty;
      let ny = hit.tx;
      if (Math.abs(nx) + Math.abs(ny) < 0.2) {
        nx = 0;
        ny = -1;
      }
      const minOff = (Math.abs(nx) * size.w + Math.abs(ny) * size.h) / 2 + 12;
      const dists = [minOff, minOff + 10, minOff + 20, minOff + 32, minOff + 48, minOff + 64];
      for (const side of [sidePref, -sidePref]) {
        for (const dist of dists) {
          const textAt = {
            x: hit.p.x + nx * side * dist,
            y: hit.p.y + ny * side * dist,
          };
          const box = boxAt(textAt, size.w, size.h);
          if (!inBounds(box, bounds.w, bounds.h)) continue;
          const leaderTo = leaderToPill(hit.p, textAt, box);
          const stem = Math.hypot(leaderTo.x - hit.p.x, leaderTo.y - hit.p.y);
          if (stem < 10) continue;
          if (boxesHit(box, { l: hit.p.x - 6, r: hit.p.x + 6, t: hit.p.y - 6, b: hit.p.y + 6 }, 0)) continue;
          let score = (dist - minOff) * 0.45;
          score += obstacleHits(box, obstacles) * 420;
          for (const p of placedAt) {
            if (boxesHit(box, p.box)) score += 560;
            if (dist2(hit.p, p.attach) < 22 * 22) score += 180;
            if (dist2(textAt, p.textAt) < 28 * 28) score += 90;
          }
          if (Math.abs(hit.tx) > Math.abs(hit.ty) && side * ny < 0) score += 6;
          cands.push({
            score,
            lab: {
              id: w.id,
              circuit: w.circuit,
              note: w.note,
              attach: hit.p,
              textAt,
              box,
              leaderTo,
            },
          });
        }
      }
    }

    if (!cands.length) {
      const hit = atLength(w.pts, clamp(total * tSpread, 10, Math.max(10, total - 10)));
      if (hit) {
        const nx = Math.abs(hit.tx) >= Math.abs(hit.ty) ? 0 : 1;
        const ny = nx === 0 ? -1 : 0;
        const dist = (Math.abs(nx) * size.w + Math.abs(ny) * size.h) / 2 + 14;
        const textAt = { x: hit.p.x + nx * dist, y: hit.p.y + ny * dist };
        const box = boxAt(textAt, size.w, size.h);
        cands.push({
          score: 9000,
          lab: {
            id: w.id,
            circuit: w.circuit,
            note: w.note,
            attach: hit.p,
            textAt,
            box,
            leaderTo: leaderToPill(hit.p, textAt, box),
          },
        });
      }
    }

    cands.sort((a, b) => a.score - b.score);
    const pick = cands[0]?.lab;
    if (pick) {
      placedAt.push(pick);
      placed.push(pick);
    }
  }

  return placed;
}
