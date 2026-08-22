/** A wire hops the firewall if its ends sit on opposite sides of the dashed line. */
export type NamedX = { id: string; x: number; label?: string; kind?: string };
export type NamedHop = { id: string; from: string; to: string; color?: string };

export type WallZone = "cab" | "wall" | "eng";

const WALL_RE =
  /dash connector|engine dash|front end|engine connector|bulkhead|firewall pass|hood conn|body builder|\(2a\)|\(2b\)|\(194\)/i;

const ENG_RE =
  /cec|379|starter|crank motor|crank motor solenoid|j31|magnetic switch|j30|glow plug|alternator|generator|pump motor|water probe|vacuum switch|fuel heater|on the engine|on trans|speedometer sensor|transmission oil temp \(345\)|fuel sender|headlight \(|horn 605|shutter solenoid|fog light \(|left turn|right turn|ether|662|396|batteries|dual mounted|camshaft|bap |filter \(399\)|inline \(401\)|booster|flow switch|diff/i;

const CAB_RE =
  /fuse|key switch|cluster|start relay \(387\)|crank relay \(661\)|431|300\)|horn relay|615|wif|399\)|overlay|aps|382|cruise|384|monitor|body builder|wait|j1|interrupt|hyd brake switch|headlight switch|turn switch|flasher/i;

export function inferZone(n: { id: string; label?: string; kind?: string; sub?: string; look?: string }): WallZone {
  const t = `${n.id} ${n.label ?? ""} ${n.sub ?? ""} ${n.kind ?? ""} ${n.look ?? ""}`;
  if (n.kind === "connector" && WALL_RE.test(t)) return "wall";
  if (WALL_RE.test(t)) return "wall";
  if (ENG_RE.test(t)) return "eng";
  if (CAB_RE.test(t)) return "cab";
  if (n.kind === "fuse") return "cab";
  return "cab";
}

export function hopsThatSkipFirewall(
  nodes: NamedX[],
  wires: NamedHop[],
  firewallX: number,
  slack = 8,
): NamedHop[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return wires.filter((w) => {
    const a = byId.get(w.from);
    const b = byId.get(w.to);
    if (!a || !b) return false;
    const left = (n: NamedX) => n.x < firewallX - slack;
    const right = (n: NamedX) => n.x > firewallX + slack;
    return (left(a) && right(b)) || (left(b) && right(a));
  });
}

/** Cab↔engine hop that never lands on a firewall connector. */
export function hopsCabEngWithoutConnector(nodes: NamedX[], wires: NamedHop[]): NamedHop[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return wires.filter((w) => {
    if (w.color === "gnd") return false;
    const a = byId.get(w.from);
    const b = byId.get(w.to);
    if (!a || !b) return false;
    const za = inferZone(a);
    const zb = inferZone(b);
    if (za === "wall" || zb === "wall") return false;
    return (za === "cab" && zb === "eng") || (za === "eng" && zb === "cab");
  });
}
