import assert from "node:assert/strict";
import { test } from "node:test";
import { routeWirePts, wireLanes } from "./wire-route.ts";

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
