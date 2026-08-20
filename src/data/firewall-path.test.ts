import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { hopsThatSkipFirewall, type NamedHop, type NamedX } from "./firewall-path.ts";

type MapBlock = {
  id: string;
  firewallX: number | null;
  nodes: NamedX[];
  wires: NamedHop[];
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
    const wires: NamedHop[] = [];
    const wireRe = /\{ id: "([^"]+)", from: "([^"]+)", to: "([^"]+)"/g;
    while ((n = wireRe.exec(block))) wires.push({ id: n[1], from: n[2], to: n[3] });
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

const WALL_NODE = /dash connector|engine dash|front end|engine connector|bulkhead|firewall pass|hood conn/i;

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
