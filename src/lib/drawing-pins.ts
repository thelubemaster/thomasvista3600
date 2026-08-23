import type { Connector, Pin } from "@/data/connectors";
import type { FlowMap } from "@/data/schematics";

function tokens(s: string): string[] {
  return s
    .toUpperCase()
    .split(/[^A-Z0-9-]+/)
    .filter((t) => t && t !== "---");
}

function cavitiesIn(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/\b([A-H]\d)\b/gi)) out.push(m[1].toUpperCase());
  for (const m of text.matchAll(/(?:^|[\s→/,=·])([A-V])(?=$|[\s→/,=·])/g)) {
    out.push(m[1].toUpperCase());
  }
  return out;
}

/** Book cavities that actually land on this schematic box — not the whole circuit family. */
export function pinsOnSchematic(conn: Connector, map: FlowMap, nodeId: string): Pin[] {
  const node = map.nodes.find((n) => n.id === nodeId);
  const wires = map.wires.filter((w) => w.from === nodeId || w.to === nodeId);
  const cavs = new Set<string>(cavitiesIn(`${node?.pins ?? ""} ${node?.sub ?? ""}`));
  for (const w of wires) {
    const fromLab = cavitiesIn(w.label ?? "");
    if (fromLab.length) {
      for (const c of fromLab) cavs.add(c);
      continue;
    }
    const ctok = tokens(w.circuit);
    for (const p of conn.pins) {
      const pinTok = tokens(p.circuit);
      if (pinTok.some((t) => ctok.includes(t)) || p.circuit.toUpperCase() === w.circuit.toUpperCase()) {
        cavs.add(p.cavity.toUpperCase());
      }
    }
  }
  return conn.pins.filter((p) => cavs.has(p.cavity.toUpperCase()));
}
