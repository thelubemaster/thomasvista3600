/** Left-to-right hop list so a drawing reads cab → wall → engine. */

export type ReadStop = { id: string; name: string; wall: boolean };
export type ReadLine = { circuit: string; stops: ReadStop[]; crosses: boolean };

const WALL_RE =
  /dash connector|engine dash|front end|engine connector|bulkhead|firewall pass|hood conn|body builder|\(2a\)|\(2b\)|\(194\)/i;

type Node = { id: string; label: string; sub?: string; kind: string; x: number; y: number };
type Wire = { from: string; to: string; circuit: string; color?: string };

export function isWallStop(n: Node, firewallX?: number): boolean {
  const t = `${n.id} ${n.label} ${n.sub ?? ""}`;
  if (n.kind === "connector" && WALL_RE.test(t)) return true;
  if (firewallX != null && n.kind === "connector" && Math.abs(n.x - firewallX) <= 20) return true;
  return false;
}

export function shortStopName(n: Node): string {
  const tag = n.label.match(/\(([^)]+)\)/);
  if (tag) return tag[1];
  const fuse = n.label.match(/FUSE\s+([A-H]\d)/i);
  if (fuse) return fuse[1].toUpperCase();
  if (n.sub && n.sub.length <= 14 && !/^[—\-\s]+$/.test(n.sub)) return n.sub;
  return n.label.replace(/\s+/g, " ").slice(0, 18);
}

export function readLines(map: { firewallX?: number; nodes: Node[]; wires: Wire[] }): ReadLine[] {
  const byId = new Map(map.nodes.map((n) => [n.id, n]));
  const byC = new Map<string, Set<string>>();
  for (const w of map.wires) {
    if (w.color === "gnd") continue;
    const set = byC.get(w.circuit) ?? new Set<string>();
    set.add(w.from);
    set.add(w.to);
    byC.set(w.circuit, set);
  }
  const lines: ReadLine[] = [];
  for (const [circuit, ids] of byC) {
    const nodes = [...ids]
      .map((id) => byId.get(id))
      .filter((n): n is Node => n != null && n.kind !== "splice");
    nodes.sort((a, b) => a.x - b.x || a.y - b.y);
    if (nodes.length < 2) continue;
    const stops = nodes.map((n) => ({
      id: n.id,
      name: shortStopName(n),
      wall: isWallStop(n, map.firewallX),
    }));
    const xs = nodes.map((n) => n.x);
    const fx = map.firewallX;
    const crosses = fx != null && Math.min(...xs) < fx - 8 && Math.max(...xs) > fx + 8;
    lines.push({ circuit, stops, crosses });
  }
  lines.sort((a, b) => Number(b.crosses) - Number(a.crosses) || a.circuit.localeCompare(b.circuit, undefined, { numeric: true }));
  return lines;
}
