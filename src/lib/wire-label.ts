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
    const tMid = bun.n > 1 ? 0.5 + (bun.i - (bun.n - 1) / 2) * 0.16 : 0.5;
    const sidePref = bun.i % 2 === 0 ? 1 : -1;
    const endPad = total < 90 ? Math.max(10, total * 0.18) : Math.max(56, total * 0.28);

    const cands: { score: number; lab: WireLabel }[] = [];
    const runList = runs(w.pts);
    const samples: number[] = [];
    const ts = bun.n > 1 ? [tMid, 0.5, tMid + 0.06, tMid - 0.06] : [0.5, 0.42, 0.58, 0.46, 0.54];
    if (runList.length) {
      for (const run of runList.slice(0, 2)) {
        if (run.len < 24) continue;
        const inset = Math.min(run.len * 0.32, Math.max(28, run.len * 0.22));
        const lo = run.fromS + inset;
        const hi = run.toS - inset;
        if (hi <= lo) {
          samples.push((run.fromS + run.toS) / 2);
          continue;
        }
        for (const t of ts) samples.push(lo + (hi - lo) * clamp(t, 0, 1));
      }
    }
    for (const t of ts) samples.push(total * t);
    const uniq: number[] = [];
    for (const s of samples) {
      const v = clamp(s, endPad, Math.max(endPad, total - endPad));
      if (!uniq.some((u) => Math.abs(u - v) < 6)) uniq.push(v);
    }

    for (const s of uniq) {
      const hit = atLength(w.pts, s);
      if (!hit) continue;
      const a0 = w.pts[0];
      const a1 = w.pts[w.pts.length - 1];
      const toEnd = Math.min(Math.hypot(hit.p.x - a0.x, hit.p.y - a0.y), Math.hypot(hit.p.x - a1.x, hit.p.y - a1.y));
      if (total >= 90 && toEnd < 48) continue;
      let nx = -hit.ty;
      let ny = hit.tx;
      if (Math.abs(nx) + Math.abs(ny) < 0.2) {
        nx = 0;
        ny = -1;
      }
      const minOff = (Math.abs(nx) * size.w + Math.abs(ny) * size.h) / 2 + 12;
      const dists = [minOff, minOff + 10, minOff + 20, minOff + 32, minOff + 48];
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
          if (placedAt.some((p) => boxesHit(box, p.box))) continue;
          let score = (dist - minOff) * 0.45;
          score += Math.abs(s / total - 0.5) * 520;
          score += Math.max(0, 70 - toEnd) * 8;
          score += obstacleHits(box, obstacles) * 420;
          score += obstacleHits({ l: hit.p.x - 10, r: hit.p.x + 10, t: hit.p.y - 10, b: hit.p.y + 10 }, obstacles) * 700;
          for (const p of placedAt) {
            if (boxesHit(box, p.box)) score += 2400;
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
      for (const t of [0.5, 0.38, 0.62, 0.3, 0.7]) {
        const hit = atLength(w.pts, clamp(total * t, endPad, Math.max(endPad, total - endPad)));
        if (!hit) continue;
        const nx = Math.abs(hit.tx) >= Math.abs(hit.ty) ? 0 : 1;
        const ny = nx === 0 ? -1 : 0;
        for (const side of [1, -1]) {
          const dist = (Math.abs(nx) * size.w + Math.abs(ny) * size.h) / 2 + 18;
          const textAt = { x: hit.p.x + nx * side * dist, y: hit.p.y + ny * side * dist };
          const box = boxAt(textAt, size.w, size.h);
          const hitPlaced = placedAt.some((p) => boxesHit(box, p.box));
          cands.push({
            score: 8000 + (hitPlaced ? 3000 : 0) + Math.abs(t - 0.5) * 200,
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
