import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { hopsThatSkipFirewall, type NamedHop, type NamedX } from "./firewall-path.ts";
import { readLines } from "./read-lines.ts";

type MapBlock = {
  id: string;
  firewallX: number | null;
  nodes: NamedX[];
  wires: (NamedHop & { circuit: string })[];
};

function parseMaps(src: string): MapBlock[] {
  const maps: MapBlock[] = [];
  const re = /\n  \{\n    id: "([^"]+)",\n    number: "([^"]+)",/g;
  const hits: { id: string; start: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) hits.push({ id: m[1], start: m.index });
  for (let i = 0; i < hits.length; i++) {
    const end = i + 1 < hits.length ? hits[i + 1].start : src.length;
    const block = src.slice(hits[i].start, end);
    const fx = /firewallX:\s*(\d+)/.exec(block);
    const nodes: NamedX[] = [];
    const nodeRe = /\{ id: "([^"]+)",[\s\S]*?x: (\d+)/g;
    const wiresStart = block.indexOf("wires:");
    let n: RegExpExecArray | null;
    while ((n = nodeRe.exec(block))) {
      if (wiresStart >= 0 && n.index > wiresStart) break;
      const slice = block.slice(n.index, n.index + 500);
      nodes.push({
        id: n[1],
        x: Number(n[2]),
        label: /label: "([^"]+)"/.exec(slice)?.[1],
        kind: /kind: "([^"]+)"/.exec(slice)?.[1],
      });
    }
    const wires: (NamedHop & { circuit: string })[] = [];
    const wireRe = /\{ id: "([^"]+)", from: "([^"]+)", to: "([^"]+)", circuit: "([^"]+)"/g;
    while ((n = wireRe.exec(block))) wires.push({ id: n[1], from: n[2], to: n[3], circuit: n[4] });
    maps.push({
      id: hits[i].id,
      firewallX: fx ? Number(fx[1]) : null,
      nodes,
      wires,
    });
  }
  return maps;
}

function loadCore(): MapBlock[] {
  const here = dirname(fileURLToPath(import.meta.url));
  return parseMaps(readFileSync(join(here, "schematics.ts"), "utf8"));
}

const WALL_NODE = /dash connector|engine dash|front end|engine connector|bulkhead|firewall pass|hood conn|body builder|\(194\)/i;

function isWallNode(n: NamedX | undefined): boolean {
  if (!n) return false;
  return n.kind === "connector" && WALL_NODE.test(`${n.id} ${n.label ?? ""}`);
}

function skipIds(map: MapBlock): string[] {
  if (map.firewallX == null) return [];
  const byId = new Map(map.nodes.map((n) => [n.id, n]));
  return hopsThatSkipFirewall(map.nodes, map.wires, map.firewallX)
    .filter((w) => !isWallNode(byId.get(w.from)) && !isWallNode(byId.get(w.to)))
    .map((w) => `${map.id}/${w.id}:${w.from}->${w.to}`);
}

test("circuit 19: no wire crosses the firewall except at DASH CONNECTOR (2)", () => {
  const map = loadCore().find((m) => m.id === "19");
  assert.ok(map && map.firewallX);
  const skips = hopsThatSkipFirewall(map.nodes, map.wires, map.firewallX);
  assert.deepEqual(
    skips.map((w) => `${w.id}:${w.from}->${w.to}`),
    [],
  );
});

test("no circuit drawing jumps the firewall without a connector", () => {
  const bad = loadCore().flatMap(skipIds);
  assert.deepEqual(bad, []);
});

test("circuit 19: A2 19J splices at 399-B — 431-85 is coil 19F, not a load out", () => {
  const map = loadCore().find((m) => m.id === "19");
  assert.ok(map);
  const fromA2 = map.wires.filter((w) => w.from === "a2");
  assert.deepEqual(
    fromA2.map((w) => `${w.to}:${w.circuit}`),
    ["splice19J:19J"],
  );
  const to431 = map.wires.filter((w) => w.to === "relay431");
  assert.ok(to431.some((w) => w.circuit === "19D" && w.from === "d2"));
  assert.ok(to431.some((w) => w.circuit === "19F" && w.from === "splice19J"));
  assert.equal(
    to431.some((w) => w.circuit === "19J"),
    false,
    "19J does not go into 431",
  );
  const out431 = map.wires.filter((w) => w.from === "relay431" && w.circuit === "19D");
  assert.deepEqual(
    out431.map((w) => `${w.to}:${w.circuit}`),
    ["ff399:19D"],
  );
});

test("circuit 19: 19D goes into 431 pin 30 and out pin 87 to 399-A", () => {
  const map = loadCore().find((m) => m.id === "19");
  assert.ok(map);
  const intoRel = map.wires.filter((w) => w.to === "relay431" && w.circuit === "19D");
  const outRel = map.wires.filter((w) => w.from === "relay431" && w.circuit === "19D");
  assert.deepEqual(
    intoRel.map((w) => `${w.from}->${w.to}`),
    ["d2->relay431"],
  );
  assert.deepEqual(
    outRel.map((w) => `${w.from}->${w.to}`),
    ["relay431->ff399"],
  );
  assert.equal(map.nodes.some((n) => n.id === "splice19D"), false);
});

test("fuel filter 399 is a 6-way so only six wires land on it", () => {
  const map = loadCore().find((m) => m.id === "19");
  assert.ok(map);
  const hits = map.wires.filter((w) => w.from === "ff399" || w.to === "ff399");
  assert.equal(hits.length, 6, hits.map((w) => `${w.id}:${w.from}->${w.to}`).join(", "));
});

test("circuit 19 read-line for 19B goes 399 → wall → 401", () => {
  const map = loadCore().find((m) => m.id === "19");
  assert.ok(map);
  const line = readLines({
    firewallX: map.firewallX ?? undefined,
    nodes: map.nodes.map((n) => ({
      id: n.id,
      label: n.label ?? n.id,
      kind: n.kind ?? "load",
      x: n.x,
      y: 0,
    })),
    wires: map.wires,
  }).find((l) => l.circuit === "19B");
  assert.ok(line?.crosses, "19B crosses the firewall");
  const names = line.stops.map((s) => s.name);
  assert.ok(names.includes("399") || names.some((n) => /399/.test(n)));
  assert.ok(line.stops.some((s) => s.wall), "includes the wall plug");
});
