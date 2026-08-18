import { useEffect, useMemo, useState, type ReactNode } from "react";
import { PlugArt } from "@/components/plug-art";
import { RelaySocket } from "@/components/relay-socket";
import { circuitFamily, circuitLabel } from "@/data/circuits";
import { findCircuitHits, type Connector, type Pin } from "@/data/connectors";
import type { RelayFace, RelayPin } from "@/data/relay-pins";
import type { FlowMap, FlowNode, FlowWire } from "@/data/schematics";
import { resolvePart } from "@/lib/resolve-part";
import { cn } from "@/lib/utils";

export function PartInspect({
  map,
  node,
  wire,
  onPickNode,
  onClose,
}: {
  map: FlowMap;
  node?: FlowNode;
  wire?: FlowWire;
  onPickNode: (id: string) => void;
  onClose: () => void;
}) {
  const part = resolvePart(node);
  const circuitHint = wire?.circuit ?? map.number.match(/^\d+/)?.[0] ?? "";
  const family = circuitFamily(circuitHint) || circuitHint;

  if (part?.relay) {
    return (
      <RelayInspect
        face={part.relay}
        family={family}
        map={map}
        node={node}
        onClose={onClose}
        onPickNode={onPickNode}
      />
    );
  }
  if (part?.connector) {
    return (
      <ConnectorInspect
        conn={part.connector}
        relay={part.relay}
        hintCavity={part.hintCavity}
        family={family}
        map={map}
        node={node}
        onClose={onClose}
        onPickNode={onPickNode}
      />
    );
  }
  if (wire) {
    return <WireInspect map={map} wire={wire} onPickNode={onPickNode} onClose={onClose} />;
  }
  if (node) {
    return <NodeInspect map={map} node={node} family={family} onPickNode={onPickNode} onClose={onClose} />;
  }
  return null;
}

function Shell({
  kicker,
  title,
  sub,
  inspectId,
  onClose,
  children,
}: {
  kicker: string;
  title: string;
  sub?: string;
  inspectId?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <section
      data-inspect={inspectId ?? "part"}
      className="flex h-full min-h-0 flex-col overflow-hidden rounded-sm border border-accent bg-raised"
    >
      <header className="flex shrink-0 items-start gap-2 border-b border-border px-2 py-1.5">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] tracking-widest text-accent uppercase">{kicker}</p>
          <h3 className="font-display text-base font-semibold leading-tight">{title}</h3>
          {sub ? <p className="text-[11px] leading-snug text-muted">{sub}</p> : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 shrink-0 place-items-center rounded-xs border border-border text-muted hover:text-fg"
          aria-label="Close pinout"
        >
          ×
        </button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto p-2 [max-height:min(56vh,28rem)] [[.h-full_&]]:max-h-none">{children}</div>
    </section>
  );
}

function ConnectorInspect({
  conn,
  relay,
  hintCavity,
  family,
  map,
  node,
  onClose,
  onPickNode,
}: {
  conn: Connector;
  relay?: RelayFace;
  hintCavity?: string;
  family: string;
  map: FlowMap;
  node?: FlowNode;
  onClose: () => void;
  onPickNode: (id: string) => void;
}) {
  const onThis = useMemo(
    () => conn.pins.filter((p) => family && circuitFamily(p.circuit) === family),
    [conn, family],
  );
  const first =
    (hintCavity && onThis.find((p) => p.cavity === hintCavity)?.cavity) ||
    onThis[0]?.cavity ||
    hintCavity ||
    conn.pins.find((p) => p.circuit !== "---")?.cavity ||
    conn.pins[0]?.cavity;
  const [cavity, setCavity] = useState<string | null>(first ?? null);
  const [onlyThis, setOnlyThis] = useState(false);

  useEffect(() => {
    setCavity(first ?? null);
    setOnlyThis(false);
  }, [conn.id, first]);

  const pin: Pin | undefined = conn.pins.find((p) => p.cavity === cavity) ?? conn.pins[0];
  const rows = onlyThis && onThis.length ? onThis : [...onThis, ...conn.pins.filter((p) => !onThis.includes(p))];
  const hits = pin ? findCircuitHits(pin.circuit) : [];
  const hops = node ? wiresOnNode(map, node.id) : [];

  return (
    <Shell
      inspectId={conn.id}
      kicker={`${relay ? "Relay" : "Connector"} ${conn.tag} · p.${conn.page} · every cavity`}
      title={conn.name}
      sub={conn.harness}
      onClose={onClose}
    >
      {onThis.length ? (
        <p className="mb-2 rounded-xs border border-accent/40 bg-surface px-2 py-1.5 font-mono text-[11px] leading-snug text-fg">
          Circuit {family} on this plug:{" "}
          {onThis.map((p) => `${p.cavity}=${p.circuit}`).join(" · ")}
        </p>
      ) : null}

      <div className="mb-2 rounded-xs border border-[#c9c2b4] bg-[#f4f0e6] p-1">
        {relay ? (
          <RelaySocket face={relay} pinId={cavity ?? pin?.cavity ?? ""} onPick={setCavity} />
        ) : (
          <PlugArt tag={conn.tag} pins={conn.pins} active={pin?.cavity} family={family} onPick={setCavity} />
        )}
      </div>

      <div className="min-w-0 space-y-2">
        {pin ? (
          <div className="rounded-xs border border-border bg-surface px-2 py-1.5">
            <p className="font-mono text-[10px] tracking-widest text-accent uppercase">
              {conn.tag}-{pin.cavity} · {pin.circuit}
            </p>
            <p className="text-sm leading-snug text-fg">{circuitLabel(pin.circuit)}</p>
            <p className="text-[12px] leading-snug text-muted">{pin.dest}</p>
          </div>
        ) : null}

        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setOnlyThis(false)}
            className={cn(
              "h-8 rounded-xs border px-2 font-mono text-[11px]",
              !onlyThis ? "border-accent bg-accent text-accent-fg" : "border-border text-muted",
            )}
          >
            All {conn.pins.length} cavities
          </button>
          <button
            type="button"
            onClick={() => setOnlyThis(true)}
            className={cn(
              "h-8 rounded-xs border px-2 font-mono text-[11px]",
              onlyThis ? "border-accent bg-accent text-accent-fg" : "border-border text-muted",
            )}
            disabled={!onThis.length}
          >
            Circuit {family || map.number} · {onThis.length}
          </button>
        </div>

        <CavityTable rows={rows} active={pin?.cavity} family={family} onPick={setCavity} />
      </div>

      {hops.length ? <DrawingHops hops={hops} onPickNode={onPickNode} /> : null}

      {hits.filter((h) => !(h.connector.id === conn.id && h.pin.cavity === pin?.cavity)).length ? (
        <SameCircuit
          hits={hits.filter((h) => !(h.connector.id === conn.id && h.pin.cavity === pin?.cavity))}
          circuit={pin?.circuit ?? ""}
        />
      ) : null}
    </Shell>
  );
}

function RelayInspect({
  face,
  family,
  map,
  node,
  onClose,
  onPickNode,
}: {
  face: RelayFace;
  family: string;
  map: FlowMap;
  node?: FlowNode;
  onClose: () => void;
  onPickNode: (id: string) => void;
}) {
  const onThis = face.pins.filter((p) => family && circuitFamily(p.circuit) === family);
  const [pinId, setPinId] = useState(onThis[0]?.id ?? face.pins[0]?.id ?? "");
  useEffect(() => {
    setPinId(onThis[0]?.id ?? face.pins[0]?.id ?? "");
  }, [face.id, onThis[0]?.id, face.pins]);
  const pin: RelayPin | undefined = face.pins.find((p) => p.id === pinId) ?? face.pins[0];
  const hops = node ? wiresOnNode(map, node.id) : [];
  const hits = pin ? findCircuitHits(pin.circuit.split(/[\s/]/)[0]) : [];

  return (
    <Shell
      inspectId={`relay-${face.id}`}
      kicker={`Relay ${face.tag} · p.${face.page} · every pin`}
      title={face.name}
      sub={`${face.where}. ${face.look}`}
      onClose={onClose}
    >
      {onThis.length ? (
        <p className="mb-2 rounded-xs border border-accent/40 bg-surface px-2 py-1.5 font-mono text-[11px] leading-snug text-fg">
          Circuit {family} on this relay: {onThis.map((p) => `${p.iso}=${p.circuit}`).join(" · ")}
        </p>
      ) : null}
      <div className="grid gap-2 lg:grid-cols-[minmax(0,14rem)_minmax(0,1fr)]">
        <RelaySocket face={face} pinId={pinId} onPick={setPinId} />
        <div className="min-w-0 space-y-2">
          {pin ? (
            <div className="rounded-xs border border-border bg-surface px-2 py-1.5">
              <p className="font-mono text-[10px] tracking-widest text-accent uppercase">
                Pin {pin.id} · ISO {pin.iso} · {pin.circuit}
              </p>
              <p className="text-sm leading-snug text-fg">{pin.role}</p>
              <p className="text-[12px] leading-snug text-muted">{pin.goes}</p>
            </div>
          ) : null}
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] tracking-wide text-muted uppercase">
              <tr>
                <th className="py-1 font-medium">Pin</th>
                <th className="py-1 font-medium">ISO</th>
                <th className="py-1 font-medium">Ckt</th>
                <th className="py-1 font-medium">Goes to</th>
              </tr>
            </thead>
            <tbody>
              {face.pins.map((p) => (
                <tr
                  key={p.id}
                  className={cn(
                    "cursor-pointer border-t border-border",
                    p.id === pin?.id && "bg-surface",
                    family && circuitFamily(p.circuit) === family && "text-fg",
                  )}
                  onClick={() => setPinId(p.id)}
                >
                  <td className="py-1 font-mono text-xs text-accent">{p.id}</td>
                  <td className="py-1 font-mono text-xs">{p.iso}</td>
                  <td className="py-1 font-mono text-xs text-steel">{p.circuit}</td>
                  <td className="py-1 text-[11px] text-muted">{p.goes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {hops.length ? <DrawingHops hops={hops} onPickNode={onPickNode} /> : null}
      {hits.length ? <SameCircuit hits={hits} circuit={pin?.circuit ?? ""} /> : null}
    </Shell>
  );
}

function WireInspect({
  map,
  wire,
  onPickNode,
  onClose,
}: {
  map: FlowMap;
  wire: FlowWire;
  onPickNode: (id: string) => void;
  onClose: () => void;
}) {
  const from = map.nodes.find((n) => n.id === wire.from);
  const to = map.nodes.find((n) => n.id === wire.to);
  const hits = findCircuitHits(wire.circuit);
  return (
    <Shell
      inspectId={`wire-${wire.id}`}
      kicker={`Wire · circuit ${wire.circuit}`}
      title={circuitLabel(wire.circuit)}
      sub={`${from?.label ?? wire.from} → ${to?.label ?? wire.to}`}
      onClose={onClose}
    >
      <div className="mb-2 grid grid-cols-2 gap-1">
        {from ? (
          <button
            type="button"
            onClick={() => onPickNode(from.id)}
            className="rounded-xs border border-border bg-surface px-2 py-1.5 text-left"
          >
            <p className="font-mono text-[10px] text-accent">From</p>
            <p className="text-sm leading-snug">{from.label}</p>
            <p className="text-[11px] text-muted">{from.sub}</p>
          </button>
        ) : null}
        {to ? (
          <button
            type="button"
            onClick={() => onPickNode(to.id)}
            className="rounded-xs border border-border bg-surface px-2 py-1.5 text-left"
          >
            <p className="font-mono text-[10px] text-accent">To</p>
            <p className="text-sm leading-snug">{to.label}</p>
            <p className="text-[11px] text-muted">{to.sub}</p>
          </button>
        ) : null}
      </div>
      {hits.length ? <SameCircuit hits={hits} circuit={wire.circuit} /> : <p className="text-sm text-muted">No book cavities listed for this splice.</p>}
    </Shell>
  );
}

function NodeInspect({
  map,
  node,
  family,
  onPickNode,
  onClose,
}: {
  map: FlowMap;
  node: FlowNode;
  family: string;
  onPickNode: (id: string) => void;
  onClose: () => void;
}) {
  const hops = wiresOnNode(map, node.id);
  const circuits = [...new Set(hops.map((h) => h.circuit))];
  const hits = circuits.flatMap((c) => findCircuitHits(c));
  return (
    <Shell
      inspectId={node.id}
      kicker={`${node.kind}${node.page ? ` · p.${node.page}` : ""}`}
      title={node.label}
      sub={node.detail}
      onClose={onClose}
    >
      {hops.length ? <DrawingHops hops={hops} onPickNode={onPickNode} /> : null}
      {hits.length ? <SameCircuit hits={hits} circuit={circuits[0] ?? family} /> : null}
      {!hops.length && !hits.length ? <p className="text-sm text-muted">{node.look ?? "No pinout in the book for this box."}</p> : null}
    </Shell>
  );
}

function CavityTable({
  rows,
  active,
  family,
  onPick,
}: {
  rows: Pin[];
  active?: string;
  family: string;
  onPick: (cavity: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xs border border-border">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-surface text-[10px] tracking-wide text-muted uppercase">
          <tr>
            <th className="px-1.5 py-1 font-medium">Cavity</th>
            <th className="px-1.5 py-1 font-medium">Ckt</th>
            <th className="px-1.5 py-1 font-medium">Goes to</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const onCkt = family && circuitFamily(p.circuit) === family;
            return (
              <tr
                key={p.cavity}
                className={cn(
                  "cursor-pointer border-t border-border",
                  p.cavity === active && "bg-surface",
                  onCkt && "text-fg",
                )}
                onClick={() => onPick(p.cavity)}
              >
                <td className={cn("px-1.5 py-1 font-mono text-xs", onCkt ? "text-accent" : "text-muted")}>{p.cavity}</td>
                <td className="px-1.5 py-1 font-mono text-xs text-steel">{p.circuit}</td>
                <td className="px-1.5 py-1 text-[11px] text-muted">{p.dest}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DrawingHops({
  hops,
  onPickNode,
}: {
  hops: { otherId: string; otherLabel: string; circuit: string }[];
  onPickNode: (id: string) => void;
}) {
  return (
    <div className="mt-2">
      <p className="mb-0.5 font-mono text-[10px] tracking-widest text-subtle uppercase">On this drawing</p>
      <ul className="space-y-0.5">
        {hops.map((h) => (
          <li key={`${h.otherId}-${h.circuit}`}>
            <button
              type="button"
              onClick={() => onPickNode(h.otherId)}
              className="w-full rounded-xs px-1 py-0.5 text-left text-[12px] hover:bg-surface"
            >
              <span className="font-mono text-accent">{h.circuit}</span>
              <span className="text-muted"> → {h.otherLabel}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SameCircuit({
  hits,
  circuit,
}: {
  hits: ReturnType<typeof findCircuitHits>;
  circuit: string;
}) {
  return (
    <div className="mt-2">
      <p className="mb-0.5 font-mono text-[10px] tracking-widest text-subtle uppercase">
        {circuit} also lands at
      </p>
      <ul className="max-h-28 space-y-0 overflow-y-auto">
        {hits.slice(0, 16).map((h) => (
          <li key={`${h.connector.id}-${h.pin.cavity}`} className="px-1 py-0.5 text-[12px]">
            <span className="font-mono text-accent">
              {h.connector.tag}-{h.pin.cavity}
            </span>
            <span className="text-muted"> · {h.pin.dest}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function wiresOnNode(map: FlowMap, nodeId: string) {
  const byId = Object.fromEntries(map.nodes.map((n) => [n.id, n]));
  return map.wires
    .filter((w) => w.from === nodeId || w.to === nodeId)
    .map((w) => {
      const otherId = w.from === nodeId ? w.to : w.from;
      return { otherId, otherLabel: byId[otherId]?.label ?? otherId, circuit: w.circuit };
    });
}
