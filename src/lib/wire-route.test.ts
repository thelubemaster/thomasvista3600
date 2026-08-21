import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { routeMapWires, routeWirePts, runOverlap, wireLanes } from "./wire-route.ts";

function box(id: string, x: number, y: number) {
  return { id, x, y, label: id, kind: "connector" as const, detail: "" };
}

test("different cavities get different ports on the same box", () => {
  const a = box("a", 120, 160);
  const b = box("b", 420, 160);
  const wires = [
    { id: "1", from: "a", to: "b", circuit: "19A", label: "D → H5" },
    { id: "2", from: "a", to: "b", circuit: "19B", label: "E → E4" },
    { id: "3", from: "a", to: "b", circuit: "19C", label: "F → H6" },
  ];
  const lanes = wireLanes(wires);
  const ys = wires.map((w) => {
    const pts = routeWirePts(a, b, [a, b], lanes.get(w.id) ?? 0, { w: 600, h: 320 });
    return pts[pts.length - 1].y;
  });
  const uniq = new Set(ys.map((y) => Math.round(y)));
  assert.equal(uniq.size, 3);
  const ordered = [...ys].sort((p, q) => p - q);
  assert.ok(ordered[1] - ordered[0] >= 8, `ports too close ${ordered}`);
  assert.ok(ordered[2] - ordered[1] >= 8, `ports too close ${ordered}`);
});

test("wires from different boxes still split at a shared destination cavity-by-cavity", () => {
  const a = box("a", 100, 80);
  const c = box("c", 100, 240);
  const dest = box("b", 420, 160);
  const wires = [
    { id: "1", from: "a", to: "b", circuit: "19A", label: "D → H5" },
    { id: "2", from: "c", to: "b", circuit: "19C", label: "F → H6" },
  ];
  const lanes = wireLanes(wires);
  assert.notEqual(lanes.get("1")?.toLane, lanes.get("2")?.toLane);
  const y1 = routeWirePts(a, dest, [a, c, dest], lanes.get("1") ?? 0, { w: 600, h: 320 }).at(-1)!.y;
  const y2 = routeWirePts(c, dest, [a, c, dest], lanes.get("2") ?? 0, { w: 600, h: 320 }).at(-1)!.y;
  assert.ok(Math.abs(y1 - y2) >= 8, `shared dest ports overlap ${y1} ${y2}`);
});

function distToSeg(p: { x: number; y: number }, a: { x: number; y: number }, b: { x: number; y: number }) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  if (len2 < 1e-6) return Math.hypot(p.x - a.x, p.y - a.y);
  let t = ((p.x - a.x) * dx + (p.y - a.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (a.x + dx * t), p.y - (a.y + dy * t));
}

test("a wire that is not in a splice stays clear of the splice", () => {
  const a = box("a", 80, 160);
  const b = box("b", 420, 160);
  const splice = { id: "s", x: 250, y: 160, label: "SPLICE", kind: "splice" as const, detail: "" };
  const pts = routeWirePts(a, b, [a, b, splice], 0, { w: 520, h: 320 });
  let nearest = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    nearest = Math.min(nearest, distToSeg(splice, pts[i], pts[i + 1]));
  }
  assert.ok(nearest >= 28, `pass-by came within ${nearest.toFixed(1)}px of the splice`);
});

test("a wire into a splice lands on the splice, not a phantom 128px box", () => {
  const fuse = box("f", 80, 160);
  const splice = { id: "s", x: 220, y: 160, label: "SPLICE", kind: "splice" as const, detail: "" };
  const pts = routeWirePts(fuse, splice, [fuse, splice], 0, { w: 400, h: 280 });
  const end = pts.at(-1)!;
  const miss = Math.hypot(end.x - splice.x, end.y - splice.y);
  assert.ok(miss <= 10, `splice end ${end.x},${end.y} is ${miss.toFixed(1)}px from the dot`);
  const start = pts[0];
  const onFuse = Math.abs(start.x - (fuse.x + 64)) < 1 || Math.abs(start.x - (fuse.x - 64)) < 1;
  assert.ok(onFuse, `fuse start ${start.x},${start.y} is not on the box`);
});

test("parallel wires do not stack on the same run", () => {
  const a = box("a", 100, 160);
  const b = box("b", 520, 160);
  const wires = [
    { id: "1", from: "a", to: "b", circuit: "19A", label: "D" },
    { id: "2", from: "a", to: "b", circuit: "19B", label: "E" },
    { id: "3", from: "a", to: "b", circuit: "19C", label: "F" },
  ];
  const paths = routeMapWires([a, b], wires, { w: 700, h: 320 });
  const pts = wires.map((w) => paths.get(w.id)!);
  assert.equal(pts.filter(Boolean).length, 3);
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const ov = runOverlap(pts[i], [pts[j]]);
      assert.ok(ov < 8, `wire ${wires[i].circuit} stacks on ${wires[j].circuit} (${ov}px)`);
    }
  }
});

test("same cavity may share a port", () => {
  const a = box("a", 120, 160);
  const b = box("b", 420, 160);
  const wires = [
    { id: "1", from: "a", to: "b", circuit: "19A", label: "D → H5" },
    { id: "2", from: "a", to: "b", circuit: "19A", label: "D → H5" },
  ];
  const lanes = wireLanes(wires);
  assert.equal(lanes.get("1")?.toLane, lanes.get("2")?.toLane);
});

function parseMaps(src: string) {
  const maps: { id: string; w: number; h: number; nodes: { id: string; x: number; y: number; kind: string; label: string; detail: string }[]; wires: { id: string; from: string; to: string; circuit: string; label?: string }[] }[] = [];
  const re = /\n  \{\n    id: "([^"]+)",\n    number: "([^"]+)",/g;
  const hits: { id: string; start: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) hits.push({ id: m[1], start: m.index });
  for (let i = 0; i < hits.length; i++) {
    const end = i + 1 < hits.length ? hits[i + 1].start : src.length;
    const block = src.slice(hits[i].start, end);
    const width = /width:\s*(\d+)/.exec(block);
    const height = /height:\s*(\d+)/.exec(block);
    const nodes: { id: string; x: number; y: number; kind: string; label: string; detail: string }[] = [];
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
        kind: /kind: "([^"]+)"/.exec(slice)?.[1] ?? "load",
        label: /label: "([^"]+)"/.exec(slice)?.[1] ?? n[1],
        detail: "",
      });
    }
    const wires: { id: string; from: string; to: string; circuit: string; label?: string }[] = [];
    const wireRe = /\{ id: "([^"]+)", from: "([^"]+)", to: "([^"]+)", circuit: "([^"]+)"(?:, color: "[^"]+")?(?:, label: "([^"]+)")?/g;
    while ((n = wireRe.exec(block))) wires.push({ id: n[1], from: n[2], to: n[3], circuit: n[4], label: n[5] });
    maps.push({ id: hits[i].id, w: width ? Number(width[1]) : 1320, h: height ? Number(height[1]) : 360, nodes, wires });
  }
  return maps;
}

function onNode(p: { x: number; y: number }, n: { x: number; y: number; kind: string }) {
  if (n.kind === "splice") return Math.hypot(p.x - n.x, p.y - n.y) <= 10;
  const hw = 64;
  const hh = 28;
  const onV = Math.abs(Math.abs(p.x - n.x) - hw) < 1.5 && Math.abs(p.y - n.y) <= hh + 1;
  const onH = Math.abs(Math.abs(p.y - n.y) - hh) < 1.5 && Math.abs(p.x - n.x) <= hw + 1;
  return onV || onH;
}

test("every wire ends on its two boxes, not in empty space", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, "../data/schematics.ts"), "utf8").split("export const flowMaps")[0];
  const maps = parseMaps(src);
  assert.ok(maps.length > 10);
  const bad: string[] = [];
  for (const map of maps) {
    const byId = Object.fromEntries(map.nodes.map((n) => [n.id, n]));
    const routed = routeMapWires(map.nodes as never, map.wires, { w: map.w, h: map.h });
    for (const w of map.wires) {
      const a = byId[w.from];
      const b = byId[w.to];
      if (!a || !b) continue;
      const pts = routed.get(w.id);
      if (!pts) continue;
      if (!onNode(pts[0], a)) bad.push(`${map.id}/${w.id} start ${pts[0].x.toFixed(0)},${pts[0].y.toFixed(0)} missed ${a.kind} ${a.id}`);
      if (!onNode(pts.at(-1)!, b)) bad.push(`${map.id}/${w.id} end ${pts.at(-1)!.x.toFixed(0)},${pts.at(-1)!.y.toFixed(0)} missed ${b.kind} ${b.id}`);
    }
  }
  assert.deepEqual(bad, []);
});

test("circuit 19: a wire that is not in a splice stays out of that splice", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, "../data/schematics.ts"), "utf8").split("export const flowMaps")[0];
  const map = parseMaps(src).find((m) => m.id === "19");
  assert.ok(map);
  const splices = map.nodes.filter((n) => n.kind === "splice");
  assert.ok(splices.length >= 1);
  const routed = routeMapWires(map.nodes as never, map.wires, { w: map.w, h: map.h });
  const bad: string[] = [];
  for (const sp of splices) {
    for (const w of map.wires) {
      if (w.from === sp.id || w.to === sp.id) continue;
      const pts = routed.get(w.id);
      if (!pts) continue;
      let nearest = Infinity;
      for (let i = 0; i < pts.length - 1; i++) {
        nearest = Math.min(nearest, distToSeg(sp, pts[i], pts[i + 1]));
      }
      if (nearest < 24) bad.push(`${w.id} ${w.circuit} within ${nearest.toFixed(0)}px of ${sp.id}`);
    }
  }
  assert.deepEqual(bad, []);
});

test("circuit drawings: different wires do not run on top of each other", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, "../data/schematics.ts"), "utf8").split("export const flowMaps")[0];
  const maps = parseMaps(src);
  const stacked: string[] = [];
  for (const map of maps) {
    const routed = routeMapWires(map.nodes as never, map.wires, { w: map.w, h: map.h });
    const ids = map.wires.map((w) => w.id).filter((id) => routed.has(id));
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const ov = runOverlap(routed.get(ids[i])!, [routed.get(ids[j])!]);
        if (ov >= 24) stacked.push(`${map.id}: ${ids[i]} on ${ids[j]} (${ov.toFixed(0)}px)`);
      }
    }
  }
  assert.deepEqual(stacked, []);
});
