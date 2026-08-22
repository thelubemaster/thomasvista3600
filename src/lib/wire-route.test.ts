import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { nodeWH, routeMapWires, routeWirePts, runOverlap, wireLanes } from "./wire-route.ts";

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
  const maps: { id: string; w: number; h: number; nodes: { id: string; x: number; y: number; kind: string; label: string; detail: string; pins?: string }[]; wires: { id: string; from: string; to: string; circuit: string; label?: string }[] }[] = [];
  const re = /\n  \{\n    id: "([^"]+)",\n    number: "([^"]+)",/g;
  const hits: { id: string; start: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) hits.push({ id: m[1], start: m.index });
  for (let i = 0; i < hits.length; i++) {
    const end = i + 1 < hits.length ? hits[i + 1].start : src.length;
    const block = src.slice(hits[i].start, end);
    const width = /width:\s*(\d+)/.exec(block);
    const height = /height:\s*(\d+)/.exec(block);
    const nodes: { id: string; x: number; y: number; kind: string; label: string; detail: string; pins?: string }[] = [];
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
        pins: /pins: "([^"]+)"/.exec(slice)?.[1],
      });
    }
    const wires: { id: string; from: string; to: string; circuit: string; label?: string }[] = [];
    const wireRe = /\{ id: "([^"]+)", from: "([^"]+)", to: "([^"]+)", circuit: "([^"]+)"(?:, color: "[^"]+")?(?:, label: "([^"]+)")?/g;
    while ((n = wireRe.exec(block))) wires.push({ id: n[1], from: n[2], to: n[3], circuit: n[4], label: n[5] });
    maps.push({ id: hits[i].id, w: width ? Number(width[1]) : 1320, h: height ? Number(height[1]) : 360, nodes, wires });
  }
  return maps;
}

function onNode(p: { x: number; y: number }, n: { x: number; y: number; kind: string; pins?: string }) {
  if (n.kind === "splice") return Math.hypot(p.x - n.x, p.y - n.y) <= 10;
  const { w, h } = nodeWH(n);
  const hw = w / 2;
  const hh = h / 2;
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

test("circuit 17 starter parts do not sit on top of each other", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, "../data/schematics.ts"), "utf8").split("export const flowMaps")[0];
  const map = parseMaps(src).find((m) => m.id === "17");
  assert.ok(map);
  const ids = ["mag", "sol", "motor"];
  const parts = ids.map((id) => map.nodes.find((n) => n.id === id));
  assert.ok(parts.every(Boolean), "J30 / J31 / 436 must all be on circuit 17");
  const hw = 64;
  const hh = 28;
  const gap = 12;
  for (let i = 0; i < parts.length; i++) {
    for (let j = i + 1; j < parts.length; j++) {
      const a = parts[i]!;
      const b = parts[j]!;
      const overlapX = Math.abs(a.x - b.x) < hw * 2 + gap;
      const overlapY = Math.abs(a.y - b.y) < hh * 2 + gap;
      assert.equal(
        overlapX && overlapY,
        false,
        `${a.id} at ${a.x},${a.y} overlaps ${b.id} at ${b.x},${b.y}`,
      );
    }
  }
});

test("circuit 19: 399 has six wires on the left end and six on the right", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, "../data/schematics.ts"), "utf8").split("export const flowMaps")[0];
  const map = parseMaps(src).find((m) => m.id === "19");
  assert.ok(map);
  const plug = map.nodes.find((n) => n.id === "ff399");
  assert.ok(plug);
  const routed = routeMapWires(map.nodes as never, map.wires, { w: map.w, h: map.h });
  const { w, h } = nodeWH(plug);
  let left = 0;
  let right = 0;
  let tb = 0;
  const dead: string[] = [];
  for (const w0 of map.wires.filter((x) => x.from === "ff399" || x.to === "ff399")) {
    const pts = routed.get(w0.id);
    assert.ok(pts && pts.length >= 2, w0.id);
    const end = w0.from === "ff399" ? pts[0] : pts[pts.length - 1];
    const onL = Math.abs(end.x - (plug.x - w / 2)) < 2 && Math.abs(end.y - plug.y) <= h / 2 + 2;
    const onR = Math.abs(end.x - (plug.x + w / 2)) < 2 && Math.abs(end.y - plug.y) <= h / 2 + 2;
    const onT = Math.abs(end.y - (plug.y - h / 2)) < 2;
    const onB = Math.abs(end.y - (plug.y + h / 2)) < 2;
    if (onL) left += 1;
    else if (onR) right += 1;
    else if (onT || onB) tb += 1;
    const otherId = w0.from === "ff399" ? w0.to : w0.from;
    const other = map.nodes.find((n) => n.id === otherId);
    if (!other) dead.push(`${w0.id} missing ${otherId}`);
  }
  assert.equal(tb, 0, "399 wires must leave the left or right end, not the top/bottom");
  assert.equal(left, 6, `left end ${left}`);
  assert.equal(right, 6, `right end ${right}`);
  assert.deepEqual(dead, []);
});

test("circuit 19: 19D and 19C do not die at a splice", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, "../data/schematics.ts"), "utf8").split("export const flowMaps")[0];
  const map = parseMaps(src).find((m) => m.id === "19");
  assert.ok(map);
  const byId = Object.fromEntries(map.nodes.map((n) => [n.id, n]));
  function continues(circuit: string, fromId: string) {
    const outs = map.wires.filter((w) => w.circuit === circuit && (w.from === fromId || w.to === fromId));
    const names = outs.map((w) => {
      const other = w.from === fromId ? w.to : w.from;
      return `${other}:${byId[other]?.kind}`;
    });
    return names;
  }
  const dFrom399 = continues("19D", "ff399");
  assert.ok(dFrom399.some((s) => s.startsWith("d2:")), `cab 19D ${dFrom399}`);
  assert.ok(dFrom399.some((s) => s.startsWith("relay431:")), `overlay 19D ${dFrom399}`);
  const cFrom399 = continues("19C", "ff399");
  assert.ok(cFrom399.length >= 2, `19C on 399 ${cFrom399}`);
  const cabC = map.wires.find((w) => w.circuit === "19C" && (w.from === "splice19C" || w.to === "splice19C") && w.from !== "ff399" && w.to !== "ff399");
  assert.ok(cabC, "cab 19C continues past the splice");
  const other = cabC.from === "splice19C" ? cabC.to : cabC.from;
  assert.equal(other, "bulkhead");
  const lamp = map.wires.find((w) => w.to === "lamp434" || w.from === "lamp434");
  assert.ok(lamp && lamp.circuit === "19K", "434 is 19K on page 50, not 19M");
  const test470 = map.wires.find((w) => w.to === "mod470" && w.from === "diode1cr");
  assert.ok(test470 && test470.circuit === "19M", "470 TEST is 19M through 1CR");
  const aFrom399 = continues("19A", "ff399");
  assert.ok(aFrom399.some((s) => s.startsWith("relay431:")), `19A overlay is 431-87 ${aFrom399}`);
  assert.ok(aFrom399.some((s) => s.startsWith("splice19A:")), `19A cab goes to the wall ${aFrom399}`);
});

test("circuit 19 boxes stay on the canvas and do not sit on each other", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, "../data/schematics.ts"), "utf8").split("export const flowMaps")[0];
  const map = parseMaps(src).find((m) => m.id === "19");
  assert.ok(map);
  const clipped: string[] = [];
  const piled: string[] = [];
  for (const n of map.nodes) {
    const { w, h } = nodeWH(n);
    const l = n.x - w / 2;
    const r = n.x + w / 2;
    const t = n.y - h / 2;
    const b = n.y + h / 2;
    if (l < 8) clipped.push(`${n.id} off left ${l.toFixed(0)}`);
    if (r > map.w - 8) clipped.push(`${n.id} off right ${r.toFixed(0)}/${map.w}`);
    if (t < 24) clipped.push(`${n.id} off top ${t.toFixed(0)}`);
    if (b > map.h - 8) clipped.push(`${n.id} off bottom ${b.toFixed(0)}/${map.h}`);
  }
  const boxes = map.nodes.filter((n) => n.kind !== "splice");
  for (let i = 0; i < boxes.length; i++) {
    for (let j = i + 1; j < boxes.length; j++) {
      const a = boxes[i]!;
      const b = boxes[j]!;
      const aw = nodeWH(a);
      const bw = nodeWH(b);
      const gap = 12;
      const hitX = Math.abs(a.x - b.x) < aw.w / 2 + bw.w / 2 + gap;
      const hitY = Math.abs(a.y - b.y) < aw.h / 2 + bw.h / 2 + gap;
      if (hitX && hitY) piled.push(`${a.id}@${a.x},${a.y} on ${b.id}@${b.x},${b.y}`);
    }
  }
  assert.deepEqual(clipped, []);
  assert.deepEqual(piled, []);
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
