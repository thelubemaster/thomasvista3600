import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { hopsCabEngWithoutConnector, hopsThatSkipFirewall, type NamedHop, type NamedX } from "./firewall-path.ts";
import { readLines } from "./read-lines.ts";
import { worldParts, worldWires } from "./world.ts";

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

test("circuit 18: plug return stays on the engine; 18-G wait lamp crosses at 2B-G3", () => {
  const map = loadCore().find((m) => m.id === "18");
  assert.ok(map && map.firewallX);
  const plugGnd = map.wires.filter((w) => w.from === "plugs" || w.to === "plugs");
  assert.equal(
    plugGnd.some((w) => w.from === "front" || w.to === "front"),
    false,
    "glow plugs do not land on FRONT END (2B)",
  );
  assert.ok(
    plugGnd.some((w) => /gnd/i.test(w.to) || /gnd/i.test(w.from) || w.circuit === "11"),
    "plugs return on engine ground",
  );
  const wait = map.wires.filter((w) => w.circuit === "18-G");
  assert.ok(wait.some((w) => w.from === "front" || w.to === "front"), "18-G lands on FRONT END G3");
  assert.ok(wait.some((w) => w.from === "cl" || w.to === "cl"), "18-G reaches the cluster wait lamp");
});

test("circuit 19: A2 19J lands on cab 399-B — 431-85 is coil 19F from the overlay B splice", () => {
  const map = loadCore().find((m) => m.id === "19");
  assert.ok(map);
  const fromA2 = map.wires.filter((w) => w.from === "a2");
  assert.deepEqual(
    fromA2.map((w) => `${w.to}:${w.circuit}`),
    ["ff399:19J"],
  );
  const to431 = map.wires.filter((w) => w.to === "relay431");
  assert.ok(to431.some((w) => w.circuit === "19D" && w.from === "ff399"));
  assert.ok(to431.some((w) => w.circuit === "19F" && w.from === "spliceWlB"));
  assert.equal(
    to431.some((w) => w.circuit === "19J"),
    false,
    "19J does not go into 431",
  );
  const out431 = map.wires.filter((w) => w.from === "relay431" && w.circuit === "19A");
  assert.deepEqual(
    out431.map((w) => `${w.to}:${w.circuit}`),
    ["ff399:19A"],
  );
});

test("circuit 19: 399-A is 19D D2↔431-30; 399-D is 19A 431-87 straight, no jumper", () => {
  const map = loadCore().find((m) => m.id === "19");
  assert.ok(map);
  const intoRel = map.wires.filter((w) => w.to === "relay431" && w.circuit === "19D");
  const out87 = map.wires.filter((w) => w.from === "relay431" && w.circuit === "19A");
  assert.deepEqual(
    intoRel.map((w) => `${w.from}->${w.to}`),
    ["ff399->relay431"],
  );
  assert.deepEqual(
    out87.map((w) => `${w.from}->${w.to}`),
    ["relay431->ff399"],
  );
  assert.ok(map.wires.some((w) => w.from === "d2" && w.to === "ff399" && w.circuit === "19D"));
  assert.equal(map.nodes.some((n) => n.id === "spliceJmp"), false, "19A does not jumper");
  assert.equal(
    map.wires.some((w) => w.circuit === "19A" && (w.from === "spliceWlB" || w.to === "spliceWlB")),
    false,
    "19A does not jumper into overlay B",
  );
});

test("fuel filter 399 is a through 6-way so twelve wires land on it", () => {
  const map = loadCore().find((m) => m.id === "19");
  assert.ok(map);
  const hits = map.wires.filter((w) => w.from === "ff399" || w.to === "ff399");
  assert.equal(hits.length, 12, hits.map((w) => `${w.id}:${w.from}->${w.to}`).join(", "));
  const byId = new Map(map.nodes.map((n) => [n.id, n]));
  const plug = byId.get("ff399");
  assert.ok(plug);
  let left = 0;
  let right = 0;
  const leftIds: string[] = [];
  const rightIds: string[] = [];
  for (const w of hits) {
    const other = byId.get(w.from === "ff399" ? w.to : w.from);
    if (!other) continue;
    if (other.x < plug.x) {
      left += 1;
      leftIds.push(other.id);
    }
    if (other.x > plug.x) {
      right += 1;
      rightIds.push(other.id);
    }
  }
  assert.equal(left, 6, `overlay-end wires ${left}: ${leftIds.join(", ")}`);
  assert.equal(right, 6, `cab-end wires ${right}: ${rightIds.join(", ")}`);
  assert.equal(map.nodes.some((n) => n.id === "ffMate"), false);
  assert.ok(leftIds.includes("relay431"), "overlay face has 431-30 (printed page 50, below 399)");
  assert.ok(leftIds.includes("diode1cr"), "overlay C is 1CR 19M");
  assert.ok(rightIds.includes("d2"), "cab face has D2 on 399-A");
  assert.ok(rightIds.includes("a2"), "cab face has A2 on 399-B");
  assert.ok(rightIds.includes("splice19A") && rightIds.includes("splice19B") && rightIds.includes("splice19C"), "cab face has 19A/B/C to the wall");
  assert.equal(leftIds.includes("d2"), false);
  assert.equal(rightIds.includes("relay431"), false);
});

test("circuit 19: D2 is on cab 399-A, 431 is on overlay 399-A — printed page 50", () => {
  const map = loadCore().find((m) => m.id === "19");
  assert.ok(map);
  const byId = new Map(map.nodes.map((n) => [n.id, n]));
  const plug = byId.get("ff399");
  const d2 = byId.get("d2");
  const rel = byId.get("relay431");
  const wall = byId.get("bulkhead");
  const htr = byId.get("heater");
  assert.ok(plug && d2 && rel && wall && htr);
  assert.ok(
    map.wires.some((w) => w.from === "d2" && w.to === "ff399" && w.circuit === "19D"),
    "D2 lands on cab 399-A",
  );
  assert.ok(d2.x > plug.x, "D2 is on the cab / firewall side of 399");
  assert.ok(rel.x < plug.x, "431 is on the warning-light overlay side of 399");
  assert.ok(wall.x > plug.x, "firewall is on the cab face of 399");
  assert.ok(htr.x > wall.x, "19A through 399-D goes to the heater after the wall");
  assert.ok(map.wires.some((w) => w.from === "relay431" && w.to === "ff399" && w.circuit === "19A"));
});

test("circuit 19: 470 is four wires — IGN OUT PROBE TEST, no ground", () => {
  const map = loadCore().find((m) => m.id === "19");
  assert.ok(map);
  const hits = map.wires.filter((w) => w.from === "mod470" || w.to === "mod470");
  assert.equal(hits.length, 4, hits.map((w) => `${w.id}:${w.from}->${w.to}:${w.circuit}`).join(", "));
  assert.deepEqual(
    hits.map((w) => w.circuit).sort(),
    ["19B", "19J", "19L", "19M"],
  );
  assert.equal(
    hits.some((w) => w.circuit === "11" || /gnd/i.test(w.from) || /gnd/i.test(w.to)),
    false,
    "470 has no ground pin on page 50",
  );
});

test("circuit 19: 434 is 19K only — no ground back to 399", () => {
  const map = loadCore().find((m) => m.id === "19");
  assert.ok(map);
  const hits = map.wires.filter((w) => w.from === "lamp434" || w.to === "lamp434");
  assert.deepEqual(
    hits.map((w) => `${w.from}->${w.to}:${w.circuit}`),
    ["spliceWlB->lamp434:19K"],
  );
  assert.equal(
    map.wires.some(
      (w) =>
        (w.from === "lamp434" || w.to === "lamp434") &&
        (w.from === "ff399" || w.to === "ff399" || /gnd/i.test(w.from) || /gnd/i.test(w.to) || w.circuit === "11"),
    ),
    false,
    "434 ground is not a harness wire to 399",
  );
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

test("circuit 14: 662 is 14B in from 426, 97CT out to (3) F — not into the CEC", () => {
  const map = loadCore().find((m) => m.id === "14");
  assert.ok(map && map.firewallX);
  const toRel = map.wires.filter((w) => w.to === "rel");
  const fromRel = map.wires.filter((w) => w.from === "rel");
  assert.ok(toRel.some((w) => w.circuit === "14B" && w.from === "batt426"), "14B from battery harness 426 into 662");
  assert.ok(fromRel.some((w) => w.circuit === "97CT" && w.to === "eng3"), "97CT leaves 662 toward ENGINE DASH (3) F");
  assert.ok(map.wires.some((w) => w.circuit === "97CT" && (w.from === "eng3" || w.to === "eng3") && (w.from === "c2" || w.to === "c2")));
  assert.equal(
    map.wires.some((w) => w.circuit === "97CT" && (w.from === "cec" || w.to === "cec")),
    false,
    "97CT does not land on the CEC",
  );
  assert.ok(toRel.some((w) => w.circuit === "97AH"));
  assert.ok(toRel.some((w) => w.circuit === "97CM"));
  assert.equal(fromRel.concat(toRel).length, 4, "662 is a 4-wire cube");
  assert.ok(map.wires.some((w) => w.from === "cec" && w.to === "spliceCM" && w.circuit === "97CL"), "CEC DC/DC+ lands on the 97CM splice");
  assert.ok(map.nodes.some((n) => n.id === "batt426"));
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, "schematics.ts"), "utf8");
  const start = src.indexOf('\n    id: "14"');
  const end = src.indexOf('\n    id: "15"', start);
  const block = src.slice(start, end);
  assert.ok(block.includes("97AL"), "page 70 pin 41 97AL is on the 97CM splice");
  assert.ok(/2-cavity through/.test(block), "426 is a through 2-way");
  const skips = hopsThatSkipFirewall(map.nodes, map.wires, map.firewallX);
  assert.deepEqual(
    skips.map((w) => `${w.id}:${w.from}->${w.to}`),
    [],
  );
});

test("circuit 18 drawing does not send glow return through heater relay 431", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const src = readFileSync(join(here, "schematics.ts"), "utf8");
  const start = src.indexOf('\n    id: "18"');
  const end = src.indexOf('\n    id: "97"', start);
  const block = src.slice(start, end);
  assert.ok(start >= 0 && end > start);
  const legend11 = /id: "11", cavity: "([^"]+)"/.exec(block);
  assert.ok(legend11);
  assert.equal(/431/.test(legend11[1]), false, legend11[1]);
});

test("circuit 50: both headlights get hi and lo", () => {
  const map = loadCore().find((m) => m.id === "50");
  assert.ok(map);
  const toLh = map.wires.filter((w) => w.to === "lh").map((w) => w.circuit).sort();
  const toRh = map.wires.filter((w) => w.to === "rh").map((w) => w.circuit).sort();
  assert.deepEqual(toLh, ["52", "53"]);
  assert.ok(toRh.includes("52B") || toRh.includes("52"));
  assert.ok(toRh.includes("53A") || toRh.includes("53"));
});

test("circuit 98: 384 A/B are ATA splices, not C/D", () => {
  const map = loadCore().find((m) => m.id === "98");
  assert.ok(map);
  const toDiag = map.wires.filter((w) => w.to === "diag");
  assert.ok(toDiag.some((w) => w.circuit === "98B+" && w.from === "red"));
  assert.ok(toDiag.some((w) => w.circuit === "98D−" && w.from === "blu"));
  assert.equal(toDiag.some((w) => w.from === "eng3"), false);
});

test("circuit 90: relay 300 is on the engine; 90A does not cross DASH CONNECTOR (2)", () => {
  const map = loadCore().find((m) => m.id === "90");
  assert.ok(map && map.firewallX);
  const byId = new Map(map.nodes.map((n) => [n.id, n]));
  const rel = byId.get("rel");
  const bulk = byId.get("bulk");
  const sol = byId.get("sol");
  const e3 = byId.get("e3");
  const pump = byId.get("pump");
  const diff = byId.get("diff");
  assert.ok(rel && bulk && sol && e3 && pump && diff);
  assert.ok(rel.x > map.firewallX, "300 is engine-side of (2)");
  assert.ok(sol.x > map.firewallX, "J31 90A stays on the engine");
  assert.ok(pump.x > map.firewallX, "pump is on the engine");
  assert.ok(e3.x < map.firewallX, "E3 is in the cab");
  assert.equal(
    map.wires.some((w) => w.circuit === "90A" && (w.from === "bulk" || w.to === "bulk")),
    false,
    "90A does not land on DASH CONNECTOR (2)",
  );
  assert.ok(
    map.wires.some(
      (w) => w.circuit === "90B" && ((w.from === "e3" && w.to === "bulk") || (w.from === "bulk" && w.to === "e3")),
    ),
    "90B tap crosses (2) A6 between the 90A splice and E3",
  );
  assert.ok(map.wires.some((w) => w.from === "splice30" && w.to === "bulk" && w.circuit === "90B"));
  assert.ok(map.wires.some((w) => w.from === "bulk" && w.to === "e3" && w.circuit === "90B"));
  assert.equal(
    map.wires.some((w) => w.from === "e3" && (w.to === "rel" || w.to === "splice30")),
    false,
    "E3 does not feed 300 — 90B is a tap off 90A toward the fuse",
  );
  assert.ok(map.wires.some((w) => w.circuit === "90H" && (w.from === "pump" || w.to === "pump")));
  assert.ok(map.wires.some((w) => w.circuit === "90H" && (w.from === "bulk" || w.to === "bulk")));
  const on300 = map.wires.filter((w) => w.from === "rel" || w.to === "rel");
  assert.ok(on300.length <= 5, on300.map((w) => `${w.id}:${w.circuit}`).join(", "));
  assert.equal(
    map.wires.some((w) => (w.from === "diff" || w.to === "diff") && w.circuit === "90P"),
    false,
    "301 is 90K / 90L — 90P is not a 301 pin",
  );
  const on301 = map.wires.filter((w) => w.from === "diff" || w.to === "diff");
  assert.deepEqual(
    on301.map((w) => w.circuit).sort(),
    ["90K", "90L"],
  );
  assert.equal(
    map.wires.some((w) => w.circuit === "90J / 90M"),
    false,
    "90J stays on the engine; 90M is the wall wire",
  );
  assert.ok(map.wires.some((w) => w.from === "bulk" && w.to === "diode" && w.circuit === "90H"));
  assert.ok(map.wires.some((w) => w.circuit === "90D" && (w.from === "diode" || w.to === "diode")));
  assert.ok(map.wires.some((w) => w.circuit === "90U" && (w.from === "diode" || w.to === "diode")));
  const skips = hopsThatSkipFirewall(map.nodes, map.wires, map.firewallX);
  assert.deepEqual(
    skips.map((w) => `${w.id}:${w.from}->${w.to}`),
    [],
  );
});

test("circuit 17: 97P from H1 lands on DASH CONNECTOR (2), not relay 615", () => {
  const map = loadCore().find((m) => m.id === "17");
  assert.ok(map);
  assert.equal(map.nodes.some((n) => n.id === "r615"), false, "615 is MD overlay — not on the 3600 drawing");
  const fromH1 = map.wires.filter((w) => w.from === "h1" && w.circuit === "97P");
  assert.deepEqual(
    fromH1.map((w) => `${w.to}:${w.circuit}`),
    ["bulk:97P"],
  );
  assert.equal(map.wires.some((w) => w.circuit === "97AV"), false, "97AV does not land on 661");
  const on661 = map.wires.filter((w) => w.from === "r661" || w.to === "r661");
  assert.ok(on661.length <= 5, on661.map((w) => w.id).join(", "));
  assert.ok(map.wires.some((w) => w.circuit === "97H" && (w.from === "eng3" || w.to === "eng3")), "97H crosses ENGINE DASH (3) U");
  assert.equal(
    map.wires.some((w) => w.circuit === "97H" && ((w.from === "cec" && w.to === "r661") || (w.from === "r661" && w.to === "cec"))),
    false,
    "97H does not skip the wall from CEC to 661",
  );
  assert.ok(map.nodes.some((n) => n.id === "over"), "thermal overcrank is on the drawing");
  assert.equal(map.nodes.some((n) => n.id === "gndDash"), false, "387-85 is not dash ground");
  assert.ok(map.wires.some((w) => w.circuit === "17C" && (w.from === "sol" || w.to === "sol")), "17C 10PK lands on J31 S");
  assert.ok(map.wires.some((w) => w.circuit === "17F" && (w.from === "mag" || w.to === "mag")), "17F lands on J30");
  const skips = hopsThatSkipFirewall(map.nodes, map.wires, map.firewallX);
  assert.deepEqual(
    skips.map((w) => `${w.id}:${w.from}->${w.to}`),
    [],
  );
});

test("shop hops for 17B, 18-G, 662, and 17F use a wall plug", () => {
  const hops = new Set(
    hopsCabEngWithoutConnector(
      worldParts.map((p) => ({ id: p.id, label: p.label, kind: p.kind, sub: p.sub })),
      worldWires,
    ).map((w) => w.id),
  );
  assert.equal(hops.has("w-starter-r387-30"), false, "17B must use the 10PK firewall pass");
  assert.equal(hops.has("w-cec-cl28"), false, "18-G wait lamp must cross FRONT END (2B) G3");
  assert.equal(hops.has("w-fuse-r662-30"), false, "662 14B stays on the engine; 97CT crosses ENGINE DASH (3) F");
  assert.equal(
    worldWires.some((w) => w.from === "dash2" && w.to === "starter"),
    false,
    "17F does not land on J31",
  );
  assert.ok(worldWires.some((w) => w.from === "dash2" && w.to === "magSw"));
  assert.ok(worldWires.some((w) => w.id === "w-r662-eng3-97ct"));
  assert.ok(worldWires.some((w) => w.id === "w-front-cl28-18g"));
  assert.ok(worldWires.some((w) => w.id === "w-pass17b-r387"));
  assert.ok(worldWires.some((w) => w.id === "w-r387-pass-17d"), "387-85 17D crosses the starter pass to the thermal");
  assert.ok(worldWires.some((w) => w.id === "w-eng3-r661-2"), "97H lands on 661 pin 2");
});
