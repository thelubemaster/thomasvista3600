import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  bundledCavityWires,
  cavityCount,
  maxIncidentWires,
  overwiredPlugs,
  type PlugNode,
  type PlugWire,
} from "./drawing-rules.ts";
import { hopsThatSkipFirewall } from "./firewall-path.ts";

type MapBlock = {
  id: string;
  firewallX: number | null;
  nodes: (PlugNode & { x: number })[];
  wires: (PlugWire & { from: string; to: string })[];
};

function parseCore(src: string): MapBlock[] {
  const maps: MapBlock[] = [];
  const re = /\n  \{\n    id: "([^"]+)",\n    number: "([^"]+)",/g;
  const hits: { id: string; start: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) hits.push({ id: m[1], start: m.index });
  for (let i = 0; i < hits.length; i++) {
    const end = i + 1 < hits.length ? hits[i + 1].start : src.length;
    const block = src.slice(hits[i].start, end);
    const fx = /firewallX:\s*(\d+)/.exec(block);
    const nodes: MapBlock["nodes"] = [];
    const nodeRe = /\{ id: "([^"]+)",[\s\S]*?x: (\d+)/g;
    const wiresStart = block.indexOf("wires:");
    let n: RegExpExecArray | null;
    while ((n = nodeRe.exec(block))) {
      if (wiresStart >= 0 && n.index > wiresStart) break;
      const slice = block.slice(n.index, n.index + 700);
      nodes.push({
        id: n[1],
        x: Number(n[2]),
        label: /label: "([^"]+)"/.exec(slice)?.[1] ?? n[1],
        kind: /kind: "([^"]+)"/.exec(slice)?.[1] ?? "load",
        sub: /sub: "([^"]*)"/.exec(slice)?.[1],
        look: /look: "([^"]*)"/.exec(slice)?.[1],
        pins: /pins: "([^"]*)"/.exec(slice)?.[1],
        detail: /detail: "([^"]*)"/.exec(slice)?.[1],
      });
    }
    const wires: MapBlock["wires"] = [];
    const wireRe =
      /\{ id: "([^"]+)", from: "([^"]+)", to: "([^"]+)", circuit: "([^"]+)", color: "([^"]+)"(?:, label: "([^"]+)")?/g;
    while ((n = wireRe.exec(block))) {
      wires.push({ id: n[1], from: n[2], to: n[3], circuit: n[4], color: n[5], label: n[6] });
    }
    maps.push({ id: hits[i].id, firewallX: fx ? Number(fx[1]) : null, nodes, wires });
  }
  return maps;
}

function parseMore(src: string): MapBlock[] {
  const maps: MapBlock[] = [];
  const re =
    /map\("([^"]+)",\s*"([^"]+)",\s*(?:true|false),\s*"[^"]*",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)",\s*"([^"]*)"(?:,\s*\{ id: "([^"]*)", label: "([^"]*)", sub: "([^"]*)" \})?\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const id = m[1];
    const from = m[4];
    const fromSub = m[5];
    const to = m[6];
    const toSub = m[7];
    const midLabel = m[9];
    const midSub = m[10];
    const nodes: MapBlock["nodes"] = [
      { id: "a", label: from, sub: fromSub, kind: "source", x: 120, look: from },
    ];
    const wires: MapBlock["wires"] = [];
    const wall = Boolean(midLabel && /dash connector|engine dash|front end|firewall|bulkhead|body builder \(194\)|engine connector/i.test(midLabel));
    if (midLabel) {
      nodes.push({
        id: "m",
        label: midLabel,
        sub: midSub,
        kind: "connector",
        x: 500,
        look: midLabel,
        pins: midSub,
      });
      nodes.push({ id: "b", label: to, sub: toSub, kind: "load", x: 880, look: to });
      wires.push({ id: "w1", from: "a", to: "m", circuit: id, color: "ign" });
      wires.push({ id: "w2", from: "m", to: "b", circuit: id, color: "a" });
    } else {
      nodes.push({ id: "b", label: to, sub: toSub, kind: "load", x: 700, look: to });
      wires.push({ id: "w1", from: "a", to: "b", circuit: id, color: "ign" });
    }
    maps.push({ id, firewallX: wall ? 500 : null, nodes, wires });
  }
  return maps;
}

function loadAll(): MapBlock[] {
  const here = dirname(fileURLToPath(import.meta.url));
  const core = parseCore(readFileSync(join(here, "schematics.ts"), "utf8"));
  const more = parseMore(readFileSync(join(here, "schematics-more.ts"), "utf8"));
  return [...core, ...more];
}

const WALL_NODE = /dash connector|engine dash|front end|engine connector|bulkhead|firewall pass|hood conn|body builder|\(194\)/i;

function isWallNode(n: PlugNode | undefined): boolean {
  if (!n) return false;
  return n.kind === "connector" && WALL_NODE.test(`${n.id} ${n.label ?? ""}`);
}

test("5-pin relays are not counted as 4-pin", () => {
  assert.equal(cavityCount({ id: "r661", kind: "relay", label: "CRANK RELAY (661)", pins: "1 2 3 4 5" }), 5);
  assert.equal(cavityCount({ id: "r300", kind: "relay", label: "HYDRAULIC BRAKE BOOSTER RELAY (300)", look: "5-cavity square." }), 5);
  assert.equal(cavityCount({ id: "r284", kind: "relay", label: "ABS WARNING LIGHT RELAY (284)", look: "5-cavity micro." }), 5);
  assert.equal(cavityCount({ id: "r387", kind: "relay", label: "START RELAY (387)", look: "Black 4-cavity." }), 4);
  assert.equal(cavityCount({ id: "r662", kind: "relay", label: "CEC MODULE PWR RELAY W/T444E (662)", look: "ISO 4-cavity." }), 4);
});

test("399 is a 6-way through-plug; dash (2) and 401 are through plugs", () => {
  assert.equal(cavityCount({ id: "ff399", kind: "connector", label: "FUEL FILTER (399)", pins: "A B C D E F" }), 6);
  assert.equal(maxIncidentWires({ id: "ff399", kind: "connector", label: "FUEL FILTER (399)", pins: "A B C D E F" }), 12);
  assert.equal(cavityCount({ id: "inline", kind: "connector", label: "IN-LINE (401)", look: "3-cavity.", pins: "A B C" }), 3);
  assert.equal(maxIncidentWires({ id: "inline", kind: "connector", label: "IN-LINE (401)", look: "3-cavity.", pins: "A B C" }), 6);
  assert.equal(cavityCount({ id: "sw", kind: "connector", label: "Stop switch 51", look: "2-cavity on the hyd stop switch.", pins: "A B" }), 2);
});

test("no plug gets more landing wires than it has cavities", () => {
  const bad: string[] = [];
  for (const map of loadAll()) {
    for (const hit of overwiredPlugs(map.nodes, map.wires)) {
      bad.push(`${map.id}/${hit.nodeId} ${hit.label}: ${hit.count} wires > ${hit.max} cavities (${hit.wires.join(", ")})`);
    }
  }
  assert.deepEqual(bad, []);
});

test("wires that are not the same cavity are not drawn as one line into a box", () => {
  const bad: string[] = [];
  for (const map of loadAll()) {
    for (const w of bundledCavityWires(map.wires)) {
      bad.push(`${map.id}/${w.id} ${w.circuit} ${w.from}->${w.to}`);
    }
  }
  assert.deepEqual(bad, []);
});

test("a hop that meets the firewall line still has to be a wall plug", () => {
  const bad: string[] = [];
  for (const map of loadAll()) {
    if (map.firewallX == null) continue;
    const byId = new Map(map.nodes.map((n) => [n.id, n]));
    for (const w of hopsThatSkipFirewall(map.nodes, map.wires, map.firewallX)) {
      if (isWallNode(byId.get(w.from)) || isWallNode(byId.get(w.to))) continue;
      bad.push(`${map.id}/${w.id}:${w.from}->${w.to}`);
    }
  }
  assert.deepEqual(bad, []);
});

test("fuel filter 399 is a through 6-way so twelve wires land on it", () => {
  const map = loadAll().find((m) => m.id === "19");
  assert.ok(map);
  const hits = map.wires.filter((w) => w.from === "ff399" || w.to === "ff399");
  assert.equal(hits.length, 12, hits.map((w) => `${w.id}:${w.from}->${w.to}`).join(", "));
  const mate = map.wires.filter((w) => w.from === "ffMate" || w.to === "ffMate");
  assert.equal(mate.length, 6, "mate face is the other six");
});
