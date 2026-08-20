import { readFileSync } from "node:fs";

function hopsThatSkipFirewall(nodes, wires, firewallX, slack = 8) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return wires.filter((w) => {
    const a = byId.get(w.from);
    const b = byId.get(w.to);
    if (!a || !b) return false;
    const left = (n) => n.x < firewallX - slack;
    const right = (n) => n.x > firewallX + slack;
    return (left(a) && right(b)) || (left(b) && right(a));
  });
}

const WALL_RE =
  /dash connector|\(2\)|\(2a\)|\(2b\)|engine dash|\(3\)|front end|bulkhead|firewall/i;

function parseMaps(src) {
  const maps = [];
  const re = /\n  \{\n    id: "([^"]+)",\n    number: "([^"]+)",/g;
  let m;
  const hits = [];
  while ((m = re.exec(src))) hits.push({ id: m[1], number: m[2], start: m.index });
  for (let i = 0; i < hits.length; i++) {
    const end = i + 1 < hits.length ? hits[i + 1].start : src.length;
    const block = src.slice(hits[i].start, end);
    const fx = /firewallX:\s*(\d+)/.exec(block);
    const nodes = [];
    const nodeRe = /\{ id: "([^"]+)",[\s\S]*?x: (\d+)/g;
    let n;
    const wiresStart = block.indexOf("wires:");
    while ((n = nodeRe.exec(block))) {
      if (wiresStart >= 0 && n.index > wiresStart) break;
      const slice = block.slice(n.index, n.index + 400);
      const label = /label: "([^"]+)"/.exec(slice)?.[1] ?? n[1];
      const kind = /kind: "([^"]+)"/.exec(slice)?.[1] ?? "";
      nodes.push({ id: n[1], x: Number(n[2]), label, kind });
    }
    const wires = [];
    const wireRe = /\{ id: "([^"]+)", from: "([^"]+)", to: "([^"]+)"[^}]*circuit: "([^"]+)"/g;
    while ((n = wireRe.exec(block))) {
      wires.push({ id: n[1], from: n[2], to: n[3], circuit: n[4] });
    }
    maps.push({
      id: hits[i].id,
      number: hits[i].number,
      firewallX: fx ? Number(fx[1]) : null,
      nodes,
      wires,
    });
  }
  return maps;
}

function isWall(n) {
  return n.kind === "connector" && WALL_RE.test(`${n.id} ${n.label}`);
}

function cabEngSkips(map) {
  if (map.firewallX == null) return [];
  const raw = hopsThatSkipFirewall(map.nodes, map.wires, map.firewallX);
  const byId = new Map(map.nodes.map((n) => [n.id, n]));
  return raw.filter((w) => {
    const a = byId.get(w.from);
    const b = byId.get(w.to);
    if (!a || !b) return false;
    if (isWall(a) || isWall(b)) return false;
    return true;
  });
}

const src = readFileSync(new URL("../src/data/schematics.ts", import.meta.url), "utf8");
const maps = parseMaps(src);
console.log("maps", maps.length);
for (const map of maps) {
  const skips = cabEngSkips(map);
  const fx = map.firewallX == null ? "no-fx" : `fx=${map.firewallX}`;
  if (skips.length) {
    console.log(`SKIP ${map.id} (${fx})`);
    for (const w of skips) {
      const a = map.nodes.find((n) => n.id === w.from);
      const b = map.nodes.find((n) => n.id === w.to);
      console.log(
        `  ${w.id} ${w.circuit}  ${w.from}(${a?.x} ${a?.label}) -> ${w.to}(${b?.x} ${b?.label})`,
      );
    }
  } else if (map.firewallX != null) {
    console.log(`ok   ${map.id} (${fx}) nodes=${map.nodes.length} wires=${map.wires.length}`);
  }
}

const world = readFileSync(new URL("../src/data/world.ts", import.meta.url), "utf8");
const parts = [];
const partRe =
  /\{ id: "([^"]+)", label: "([^"]+)", sub: "([^"]*)", zone: "([^"]+)"/g;
let pm;
while ((pm = partRe.exec(world))) {
  parts.push({ id: pm[1], label: pm[2], zone: pm[4] });
}
const by = new Map(parts.map((p) => [p.id, p]));
const wall = new Set(parts.filter((p) => p.zone === "wall").map((p) => p.id));
const wwRe =
  /\{ id: "([^"]+)", from: "([^"]+)", to: "([^"]+)", circuit: "([^"]+)"/g;
console.log("\nSHOP cab↔eng without a wall endpoint:");
let shopN = 0;
while ((pm = wwRe.exec(world))) {
  const a = by.get(pm[2]);
  const b = by.get(pm[3]);
  if (!a || !b) continue;
  const z = new Set([a.zone, b.zone]);
  if (z.has("cab") && z.has("eng") && !wall.has(pm[2]) && !wall.has(pm[3])) {
    shopN += 1;
    console.log(`  ${pm[1]} ckt ${pm[4]}  ${a.zone}:${a.label} -> ${b.zone}:${b.label}`);
  }
}
if (!shopN) console.log("  none");
