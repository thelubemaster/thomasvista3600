/** A wire hops the firewall if its ends sit on opposite sides of the dashed line. */
export type NamedX = { id: string; x: number };
export type NamedHop = { id: string; from: string; to: string };

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
