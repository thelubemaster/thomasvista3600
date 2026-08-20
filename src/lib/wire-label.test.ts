import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { placeWireLabels, type LabelBox, type Pt } from "./wire-label.ts";
import { routeWirePts } from "./wire-route.ts";

function hLine(y: number, x0 = 80, x1 = 520): Pt[] {
  return [
    { x: x0, y },
    { x: x1, y },
  ];
}

function distToSeg(p: Pt, a: Pt, b: Pt) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-6) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

function onPath(p: Pt, pts: Pt[], slack = 0.6) {
  for (let i = 0; i < pts.length - 1; i++) {
    if (distToSeg(p, pts[i], pts[i + 1]) <= slack) return true;
  }
  return false;
}

function overlap(a: { l: number; r: number; t: number; b: number }, b: { l: number; r: number; t: number; b: number }, gap = 2) {
  return a.l < b.r + gap && a.r + gap > b.l && a.t < b.b + gap && a.b + gap > b.t;
}

test("each label attaches to its own polyline", () => {
  const wires = [
    { id: "a", pts: hLine(120), circuit: "19A", note: "H5" },
    { id: "b", pts: hLine(132), circuit: "19B", note: "E4" },
    { id: "c", pts: hLine(144), circuit: "19C", note: "H6" },
  ];
  const labels = placeWireLabels(wires, [], { w: 600, h: 280 });
  assert.equal(labels.length, 3);
  for (const lab of labels) {
    const src = wires.find((w) => w.id === lab.id);
    assert.ok(src);
    assert.ok(onPath(lab.attach, src.pts), `${lab.id} attach is not on its wire`);
  }
});

test("parallel wire labels do not sit on top of each other", () => {
  const wires = [
    { id: "a", pts: hLine(120), circuit: "19A", note: "D → H5" },
    { id: "b", pts: hLine(132), circuit: "19B", note: "E → E4" },
    { id: "c", pts: hLine(144), circuit: "19C", note: "F → H6" },
  ];
  const labels = placeWireLabels(wires, [], { w: 600, h: 280 });
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      assert.equal(
        overlap(labels[i].box, labels[j].box),
        false,
        `${labels[i].circuit} overlaps ${labels[j].circuit}`,
      );
    }
  }
});

test("leader runs from the pill to the attach point on the wire", () => {
  const wires = [{ id: "a", pts: hLine(140), circuit: "19J", note: "399-B" }];
  const [lab] = placeWireLabels(wires, [], { w: 600, h: 280 });
  assert.ok(lab);
  const stem = Math.hypot(lab.leaderTo.x - lab.attach.x, lab.leaderTo.y - lab.attach.y);
  const pillDist = Math.hypot(lab.leaderTo.x - lab.textAt.x, lab.leaderTo.y - lab.textAt.y);
  const attachDist = Math.hypot(lab.attach.x - lab.textAt.x, lab.attach.y - lab.textAt.y);
  assert.ok(stem >= 10, `stem too short (${stem})`);
  assert.ok(attachDist >= 10, "label sits off the wire so a pointer is visible");
  assert.ok(pillDist < attachDist, "leader meets the pill, not the far side");
  assert.ok(onPath(lab.attach, wires[0].pts));
  assert.equal(
    overlap(lab.box, { l: lab.attach.x - 2, r: lab.attach.x + 2, t: lab.attach.y - 2, b: lab.attach.y + 2 }, 6),
    false,
    "pill must not cover the attach dot",
  );
});

test("labels stay inside the drawing", () => {
  const wires = [
    { id: "a", pts: hLine(20, 40, 200), circuit: "13", note: null },
    { id: "b", pts: hLine(260, 40, 200), circuit: "14", note: null },
  ];
  const labels = placeWireLabels(wires, [], { w: 240, h: 280 });
  for (const lab of labels) {
    assert.ok(lab.box.l >= 0 && lab.box.t >= 0 && lab.box.r <= 240 && lab.box.b <= 280, lab.circuit);
  }
});

type Node = { id: string; x: number; y: number; label: string; kind: string; detail: string; sub?: string };
type Wire = { id: string; from: string; to: string; circuit: string; label?: string };

function parseMaps(src: string) {
  const maps: { id: string; w: number; h: number; firewallX: number | null; nodes: Node[]; wires: Wire[] }[] = [];
  const re = /\n  \{\n    id: "([^"]+)",\n    number: "([^"]+)",/g;
  const hits: { id: string; start: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) hits.push({ id: m[1], start: m.index });
  for (let i = 0; i < hits.length; i++) {
    const end = i + 1 < hits.length ? hits[i + 1].start : src.length;
    const block = src.slice(hits[i].start, end);
    const fx = /firewallX:\s*(\d+)/.exec(block);
    const width = /width:\s*(\d+)/.exec(block);
    const height = /height:\s*(\d+)/.exec(block);
    const nodes: Node[] = [];
    const nodeRe = /\{ id: "([^"]+)",[\s\S]*?x: (\d+),\s*y: (\d+)/g;
    const wiresStart = block.indexOf("wires:");
    let n: RegExpExecArray | null;
    while ((n = nodeRe.exec(block))) {
      if (wiresStart >= 0 && n.index > wiresStart) break;
      const slice = block.slice(n.index, n.index + 500);
      nodes.push({
        id: n[1],
        x: Number(n[2]),
        y: Number(n[3]),
        label: /label: "([^"]+)"/.exec(slice)?.[1] ?? n[1],
        kind: /kind: "([^"]+)"/.exec(slice)?.[1] ?? "load",
        detail: "",
      });
    }
    const wires: Wire[] = [];
    const wireRe = /\{ id: "([^"]+)", from: "([^"]+)", to: "([^"]+)", circuit: "([^"]+)"(?:, color: "[^"]+")?(?:, label: "([^"]+)")?/g;
    while ((n = wireRe.exec(block))) {
      wires.push({ id: n[1], from: n[2], to: n[3], circuit: n[4], label: n[5] });
    }
    maps.push({
      id: hits[i].id,
      w: width ? Number(width[1]) : 1320,
      h: height ? Number(height[1]) : 360,
      firewallX: fx ? Number(fx[1]) : null,
      nodes,
      wires,
    });
  }
  return maps;
}

function labelMap(map: ReturnType<typeof parseMaps>[number]) {
  const byId = Object.fromEntries(map.nodes.map((n) => [n.id, n]));
  const items = [];
  for (const w of map.wires) {
    const a = byId[w.from];
    const b = byId[w.to];
    if (!a || !b) continue;
    const siblings = map.wires.filter((x) => x.from === w.from && x.to === w.to);
    const lane = siblings.length > 1 ? (siblings.indexOf(w) - (siblings.length - 1) / 2) * 12 : 0;
    const pts = routeWirePts(a as never, b as never, map.nodes as never, lane, { w: map.w, h: map.h });
    items.push({ id: w.id, pts, circuit: w.circuit, note: w.label ?? null });
  }
  const obstacles: LabelBox[] = map.nodes.map((n) => ({ l: n.x - 70, r: n.x + 70, t: n.y - 36, b: n.y + 36 }));
  return placeWireLabels(items, obstacles, { w: map.w, h: map.h });
}

test("circuit 19: 19A/19B/19C labels do not collide", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, "../data/schematics.ts"), "utf8");
  const map = parseMaps(src).find((m) => m.id === "19");
  assert.ok(map);
  const labels = labelMap(map);
  const wall = labels.filter((l) => l.circuit === "19A" || l.circuit === "19B" || l.circuit === "19C");
  assert.ok(wall.length >= 6, `expected several 19A/B/C labels, got ${wall.length}`);
  for (const lab of labels) {
    const stem = Math.hypot(lab.leaderTo.x - lab.attach.x, lab.leaderTo.y - lab.attach.y);
    assert.ok(stem >= 10, `${lab.circuit} ${lab.id} stem ${stem}`);
  }
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      assert.equal(
        overlap(labels[i].box, labels[j].box),
        false,
        `circuit 19: ${labels[i].circuit} (${labels[i].id}) overlaps ${labels[j].circuit} (${labels[j].id})`,
      );
    }
  }
});

test("every circuit drawing: wire labels do not overlap each other", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = [readFileSync(join(here, "../data/schematics.ts"), "utf8"), readFileSync(join(here, "../data/schematics-more.ts"), "utf8")].join("\n");
  const maps = parseMaps(src);
  assert.ok(maps.length > 10);
  const collisions: string[] = [];
  for (const map of maps) {
    const labels = labelMap(map);
    for (let i = 0; i < labels.length; i++) {
      for (let j = i + 1; j < labels.length; j++) {
        if (overlap(labels[i].box, labels[j].box)) {
          collisions.push(`${map.id}: ${labels[i].circuit}/${labels[i].id} vs ${labels[j].circuit}/${labels[j].id}`);
        }
      }
    }
  }
  assert.deepEqual(collisions, []);
});
