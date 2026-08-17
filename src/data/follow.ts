import { circuitFamily } from "@/data/circuits";
import { findCircuitHits } from "@/data/connectors";
import { circuitToggles, partById, worldWires, type WireKind, type WorldWire } from "@/data/world";
import { flowMaps } from "@/data/schematics";

export type KeyPos = "off" | "acc" | "ign" | "start";

export const keyPositions: { id: KeyPos; label: string; hint: string }[] = [
  { id: "off", label: "OFF", hint: "Battery and grounds only. Key circuits are dead." },
  { id: "acc", label: "ACC", hint: "Accessory. Battery still live. IGN / starter / CEC key feeds are off." },
  { id: "ign", label: "IGN", hint: "Key-on / run. IGN fuses, CEC, fuel filter 19J, hyd brake, glow coil." },
  { id: "start", label: "START", hint: "Crank. Same as IGN plus STARTER CONTROL (17)." },
];

export function wireIsLive(w: WorldWire, key: KeyPos): boolean {
  if (w.color === "gnd" || w.color === "hot") return true;
  if (w.color === "key") return key === "acc" || key === "ign" || key === "start";
  if (w.circuit === "17") return key === "start";
  return key === "ign" || key === "start";
}

export type Hop = {
  i: number;
  wireId: string;
  fromId: string;
  toId: string;
  fromLabel: string;
  toLabel: string;
  pin: string;
  circuit: string;
  color: WireKind;
};

const ROOTS = ["bats", "j1", "key", "fuse", "gndEng", "gndCab"];

export const connToPart: Record<string, string> = {
  "fuse-block": "fuse",
  "dash-2-hyd": "dash2",
  "engine-2a-hyd": "eng2a",
  "front-2-cab": "front2b",
  "front-2b-mate": "front2b",
  "eng-dash-3": "eng3",
  "cluster-26": "cl26",
  "cluster-27": "cl27",
  "cluster-28": "cl28",
  "cec-379": "cec",
  "aps-382": "aps",
  "cruise-391": "cruise391",
  "cruise-392": "cruise392",
  "start-387": "r387",
  "modpwr-396": "r396",
  "heater-rel-431": "r431",
  "neutral-615": "r615",
  "booster-300": "r300",
  "horn-61": "r61",
  "filter-71": "ff399",
  "filter-399": "filter",
  "filter-401": "inline401",
  "wif-470": "wif470",
  "diag-384": "diag",
  "hyd-sw-50": "hydsw",
  "stop-51": "stop51",
  "monitor-49": "mon",
  "hdlamp-60": "hdsw",
  "key-63": "key",
  "abs-377": "abs377",
  "speedo-303": "spd303",
  "backup-304": "bu304",
  "tot-345": "tot345",
  "ata-p": "ataP",
  "ata-n": "ataN",
  "bap-406": "bap406",
  "ats-398": "ats398",
  "turn-459": "turn459",
  "bb-194": "bb194",
  "horn-605": "horn",
  "lh-502": "lh",
  "rh-504": "rh",
  "lt-503": "lt503",
  "alarm-20": "alarm",
  "diode-47": "diode47",
  "diff-301": "diff",
  "flow-763": "flow763",
};

function labelOf(id: string) {
  return partById(id)?.label ?? id;
}

function pinOf(w: WorldWire) {
  const bits = [w.fromPin, w.toPin].filter(Boolean);
  return bits.length ? bits.join(" → ") : "—";
}

function colorOf(circuit: string): WireKind {
  if (circuit === "11" || circuit.includes("G")) return "gnd";
  if (["14", "15", "50", "55", "70", "85"].includes(circuit)) return "hot";
  if (["12", "13", "17", "19", "28", "71", "90", "92"].includes(circuit)) return "key";
  return "sig";
}

function hopsFromWires(wires: WorldWire[]): Hop[] {
  if (!wires.length) return [];
  const start =
    ROOTS.find((id) => wires.some((w) => w.from === id || w.to === id)) ?? wires[0].from;
  const unused = new Set(wires.map((w) => w.id));
  const ordered: WorldWire[] = [];
  const q: string[] = [start];
  const seenNode = new Set<string>([start]);

  while (q.length) {
    const n = q.shift()!;
    for (const w of wires) {
      if (!unused.has(w.id)) continue;
      let next: string | null = null;
      if (w.from === n) next = w.to;
      else if (w.to === n) next = w.from;
      if (!next) continue;
      unused.delete(w.id);
      ordered.push(w);
      if (!seenNode.has(next)) {
        seenNode.add(next);
        q.push(next);
      }
    }
  }
  for (const w of wires) {
    if (unused.has(w.id)) ordered.push(w);
  }

  return ordered.map((w, i) => ({
    i: i + 1,
    wireId: w.id,
    fromId: w.from,
    toId: w.to,
    fromLabel: labelOf(w.from),
    toLabel: labelOf(w.to),
    pin: pinOf(w),
    circuit: w.circuit,
    color: w.color,
  }));
}

function hopsFromConnectors(fam: string): Hop[] {
  const hits = findCircuitHits(fam);
  if (!hits.length) return [];
  const rank = (id: string) => {
    if (id === "fuse-block" || id === "key-63") return 0;
    if (id.startsWith("cluster") || id.includes("dash") || id.includes("alarm")) return 1;
    if (id.includes("front") || id.includes("eng-dash") || id.includes("engine-2a")) return 2;
    return 3;
  };
  const seen = new Set<string>();
  const uniq = hits.filter((h) => {
    const k = `${h.connector.id}:${h.pin.cavity}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  uniq.sort((a, b) => rank(a.connector.id) - rank(b.connector.id) || a.pin.cavity.localeCompare(b.pin.cavity));

  const hops: Hop[] = [];
  for (let i = 0; i < uniq.length - 1; i++) {
    const a = uniq[i];
    const b = uniq[i + 1];
    hops.push({
      i: i + 1,
      wireId: `hit-${fam}-${i}`,
      fromId: connToPart[a.connector.id] ?? a.connector.id,
      toId: connToPart[b.connector.id] ?? b.connector.id,
      fromLabel: a.connector.name,
      toLabel: b.connector.name,
      pin: `${a.pin.cavity} → ${b.pin.cavity}`,
      circuit: b.pin.circuit || fam,
      color: colorOf(fam),
    });
  }
  if (!hops.length && uniq.length === 1) {
    const a = uniq[0];
    hops.push({
      i: 1,
      wireId: `hit-${fam}-0`,
      fromId: "fuse",
      toId: connToPart[a.connector.id] ?? a.connector.id,
      fromLabel: "FUSE BLOCK",
      toLabel: a.connector.name,
      pin: a.pin.cavity,
      circuit: a.pin.circuit || fam,
      color: colorOf(fam),
    });
  }
  return hops;
}

function hopsFromMap(fam: string): Hop[] {
  const map = flowMaps.find((m) => m.id === fam || m.number === fam);
  if (!map) return [];
  const byId = Object.fromEntries(map.nodes.map((n) => [n.id, n]));
  return map.wires.map((w, i) => {
    const a = byId[w.from];
    const b = byId[w.to];
    return {
      i: i + 1,
      wireId: `map-${map.id}-${w.id}`,
      fromId: w.from,
      toId: w.to,
      fromLabel: a?.label ?? w.from,
      toLabel: b?.label ?? w.to,
      pin: [a?.pins, b?.pins].filter(Boolean).join(" → ") || "—",
      circuit: w.circuit,
      color: colorOf(fam),
    };
  });
}

export function hopsForCircuit(circuit: string): Hop[] {
  const fam = circuitFamily(circuit) || circuit;
  const shop = hopsFromWires(worldWires.filter((w) => circuitFamily(w.circuit) === fam));
  if (shop.length >= 2) return shop;
  const pins = hopsFromConnectors(fam);
  if (pins.length) return pins;
  const mapped = hopsFromMap(fam);
  if (mapped.length) return mapped;
  return shop;
}

export function followTitle(id: string) {
  return circuitToggles.find((c) => c.id === id)?.title ?? `CIRCUIT ${id}`;
}
