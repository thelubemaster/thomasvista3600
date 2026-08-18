import { connectors, type Connector } from "@/data/connectors";
import { relayFaces, type RelayFace } from "@/data/relay-pins";
import type { FlowNode } from "@/data/schematics";

/** Shop / schematic node ids → book connector ids. */
const NODE_ALIAS: Record<string, string> = {
  bulkhead: "dash-2-hyd",
  bulk: "dash-2-hyd",
  dash2: "dash-2-hyd",
  d2conn: "dash-2-hyd",
  eng2a: "engine-2a-hyd",
  front2b: "front-2-cab",
  front2: "front-2-cab",
  eng3: "eng-dash-3",
  ff399: "filter-399",
  filter: "filter-399",
  inline: "filter-401",
  inline401: "filter-401",
  mod470: "wif-470",
  wif433: "wif-470",
  wif: "wif-470",
  key: "key-63",
  fuse: "fuse-block",
  a2: "fuse-block",
  d2: "fuse-block",
  c1: "fuse-block",
  b1: "fuse-block",
  h1: "fuse-block",
  e3: "fuse-block",
  g1: "fuse-block",
  cec: "cec-379",
  aps: "aps-382",
  diag: "diag-384",
  hydsw: "hyd-sw-50",
  stop51: "stop-51",
  mon: "monitor-49",
  hdsw: "hdlamp-60",
  turn459: "turn-459",
  bb194: "bb-194",
  cl26: "cluster-26",
  cl27: "cluster-27",
  cl28: "cluster-28",
  alarm: "alarm-20",
  lh: "lh-502",
  rh: "rh-504",
  horn: "horn-605",
  r387: "start-387",
  r396: "modpwr-396",
  r431: "heater-rel-431",
  relay431: "heater-rel-431",
  r300: "booster-300",
  r61: "horn-61",
  r615: "neutral-615",
  r661: "crank-661",
  r662: "modpwr-662",
  rel: "",
  flash: "fuse-block",
};

function connByToken(token: string): Connector | undefined {
  const t = token.trim();
  if (!t) return undefined;
  const up = t.toUpperCase();
  return (
    connectors.find((c) => c.id === t) ||
    connectors.find((c) => c.tag.toUpperCase() === up) ||
    connectors.find((c) => c.tag.replace(/\s/g, "").toUpperCase() === up.replace(/\s/g, ""))
  );
}

function relayByToken(token: string): RelayFace | undefined {
  const t = token.trim();
  if (!t) return undefined;
  const up = t.toUpperCase();
  return relayFaces.find((r) => r.id.toUpperCase() === up || r.tag.toUpperCase() === up);
}

function tokensFrom(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/\(([^)]+)\)/g)) {
    out.push(m[1]);
    for (const bit of m[1].split(/[\s,/&]+/)) if (bit) out.push(bit);
  }
  for (const bit of text.split(/[\s,/·—-]+/)) {
    if (/^(?:\d+[A-Z]?|[A-Z]\d+|FUSE|R1|GP|2B-M)$/i.test(bit)) out.push(bit);
  }
  return out;
}

export type ResolvedPart = {
  connector?: Connector;
  relay?: RelayFace;
  hintCavity?: string;
};

export function resolvePart(node: FlowNode | undefined | null): ResolvedPart | null {
  if (!node) return null;
  const out: ResolvedPart = {};

  if (node.relayId) {
    out.relay = relayByToken(node.relayId);
    out.connector =
      connByToken(node.relayId) ?? (out.relay ? connByToken(out.relay.tag) : undefined);
  }

  const alias = NODE_ALIAS[node.id];
  if (alias) {
    out.connector ??= connByToken(alias);
    if (!out.relay && out.connector) out.relay = relayByToken(out.connector.tag);
  }

  for (const tok of [...tokensFrom(node.label), ...tokensFrom(node.sub ?? "")]) {
    out.connector ??= connByToken(tok);
    out.relay ??= relayByToken(tok);
  }

  const fuseCav = node.label.match(/FUSE\s+([A-H]\d)/i) ?? node.sub?.match(/\b([A-H]\d)\b/);
  if (fuseCav && /fuse|inst|fuel|start|brake|abs|horn|xmsn|diag/i.test(node.label + (node.sub ?? ""))) {
    out.connector ??= connByToken("fuse-block");
    out.hintCavity ??= `${fuseCav[1].toUpperCase()}-B`;
  }

  if (/FRONT END/i.test(node.label)) {
    out.connector ??= connByToken("2B");
  }
  if (/DASH CONNECTOR/i.test(node.label) && !out.connector) {
    out.connector = connByToken("2");
  }

  if (!out.connector && !out.relay) return null;
  return out;
}
