/** Drawing rules for every circuit map: wall hops, cavity count, no extra pins. */

export type PlugNode = {
  id: string;
  kind: string;
  label: string;
  sub?: string;
  look?: string;
  pins?: string;
  detail?: string;
  x?: number;
};

export type PlugWire = {
  id: string;
  from: string;
  to: string;
  circuit: string;
  color?: string;
  label?: string;
};

const WALL_RE =
  /dash connector|engine dash|front end|engine connector|bulkhead|firewall pass|hood conn|body builder|\(2a\)|\(2b\)|\(194\)/i;

export function isThroughPlug(n: PlugNode): boolean {
  const t = `${n.id} ${n.label} ${n.sub ?? ""} ${n.look ?? ""}`;
  if (WALL_RE.test(t)) return true;
  if (/in-line|inline \(401\)|401\)/i.test(t)) return true;
  // 6-cavity fuel-filter plug: cab harness on one face, mate on the other.
  if (n.id === "ff399" || /^fuel filter \(399\)$/i.test((n.label ?? "").trim())) return true;
  return false;
}

function letterSpan(a: string, b: string): number {
  return b.toUpperCase().charCodeAt(0) - a.toUpperCase().charCodeAt(0) + 1;
}

export function parsePinList(pins?: string): number | null {
  if (!pins) return null;
  const p = pins.trim().replace(/–/g, "-");
  if (!p || p === "—" || /^many$/i.test(p)) return null;
  const each = /(\d+)\s*each/i.exec(p);
  if (each) return Number(each[1]);
  if (/^\d+$/.test(p)) return Number(p);
  const grid = /^([A-Z])(\d+)\s*-\s*\1(\d+)$/i.exec(p);
  if (grid) return Math.abs(Number(grid[3]) - Number(grid[2])) + 1;
  const letters = /^([A-Z])\s*-\s*([A-Z])$/i.exec(p);
  if (letters) return letterSpan(letters[1], letters[2]);
  const nums = /^(\d+)\s*-\s*(\d+)$/.exec(p);
  if (nums) return Number(nums[2]) - Number(nums[1]) + 1;
  const parts = p
    .split(/[\s,/]+/)
    .map((s) => s.replace(/=.*$/, "").trim())
    .filter((s) => s && !/^(each)$/i.test(s));
  return parts.length ? parts.length : null;
}

export function cavityCount(n: PlugNode): number | null {
  const t = `${n.label} ${n.sub ?? ""} ${n.look ?? ""} ${n.pins ?? ""}`;
  const lookN = /(\d+)\s*[-–]?\s*(?:way|cavity|cavities|pin|pins)\b/i.exec(t);
  if (lookN) return Number(lookN[1]);
  if (/\bISO 4\b/i.test(t)) return 4;
  if (/key switch/i.test(t)) return 4;
  if (/fuel filter \(399\)|\(399\)/i.test(t)) return 6;
  if (/in-line \(401\)|\(401\)/i.test(t)) return 3;
  if (/dash connector \(2\)/i.test(t) && !/\(2a\)|\(2b\)/i.test(t)) return 56;
  if (/front end|\(2b\)/i.test(t)) return 24;
  if (/engine dash \(3\)|\(3\)/i.test(t) && /22|a–v|a-v|engine dash/i.test(t)) return 22;
  if (/engine connector \(2a\)|\(2a\)/i.test(t)) return 32;
  if (/body builder \(194\)|\(194\)/i.test(t)) return 8;
  if (/headlight switch \(60\)/i.test(t)) return 8;
  if (/turn signal switch \(459\)|turn switch 459/i.test(t)) return 6;
  if (/firewall pass/i.test(t)) return 1;
  if (/yellow|green|natural|cluster (left|ctr|right|center)/i.test(t) && /17/.test(t)) return 17;
  if (n.kind === "fuse") return 2;
  if (n.kind === "relay") {
    if (/\bISO 5\b|5-cavity|5-pin|iso5|micro/i.test(t) && /661|300|284|286/.test(t)) return 5;
    if (/\bISO 5\b|5-cavity|5-pin|iso5/i.test(t)) return 5;
    if (/\b661\b|\b300\b|\b284\b|\b286\b/.test(t)) return 5;
    const fromPins = parsePinList(n.pins);
    if (fromPins != null) return fromPins;
    return 4;
  }
  return parsePinList(n.pins);
}

export function maxIncidentWires(n: PlugNode): number | null {
  const nCav = cavityCount(n);
  if (nCav == null) return null;
  return isThroughPlug(n) ? nCav * 2 : nCav;
}

export type Overwired = {
  nodeId: string;
  label: string;
  count: number;
  max: number;
  wires: string[];
};

/** Every landing on a connector or relay occupies a cavity, including ground pins. */
export function overwiredPlugs(nodes: PlugNode[], wires: PlugWire[]): Overwired[] {
  const out: Overwired[] = [];
  for (const n of nodes) {
    if (n.kind !== "connector" && n.kind !== "relay") continue;
    const max = maxIncidentWires(n);
    if (max == null) continue;
    const hits = wires.filter((w) => w.from === n.id || w.to === n.id);
    if (hits.length > max) {
      out.push({
        nodeId: n.id,
        label: n.label,
        count: hits.length,
        max,
        wires: hits.map((w) => `${w.id}:${w.from}->${w.to}`),
      });
    }
  }
  return out;
}

/** A wire that names two different circuits and is not a through-cavity rename (label has →). */
export function bundledCavityWires(wires: PlugWire[]): PlugWire[] {
  return wires.filter((w) => {
    if (w.color === "gnd") return false;
    if (!/ \//.test(w.circuit)) return false;
    if (w.label && /→|->/.test(w.label)) return false;
    const bits = w.circuit.split(/\s*\/\s*/).map((s) => s.trim()).filter(Boolean);
    return bits.length > 1;
  });
}
