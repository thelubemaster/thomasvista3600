import { useMemo, useState } from "react";
import { circuit19Legend, schematicNodes, schematicWires, type SchematicNode } from "@/data/wiring";
import { ZoomStage } from "@/components/zoom-stage";
import { cn } from "@/lib/utils";

const POS: Record<string, { x: number; y: number }> = {
  key: { x: 70, y: 80 },
  bat: { x: 70, y: 260 },
  a2: { x: 250, y: 80 },
  d2: { x: 250, y: 260 },
  relay431: { x: 250, y: 170 },
  ff399: { x: 480, y: 160 },
  bulkhead: { x: 720, y: 160 },
  inline: { x: 960, y: 160 },
  heater: { x: 1180, y: 80 },
  probe: { x: 1180, y: 240 },
};

const W = 1320;
const H = 340;

function pathBetween(from: string, to: string, offset = 0) {
  const a = POS[from];
  const b = POS[to];
  if (!a || !b) return "";
  const y1 = a.y + offset;
  const y2 = b.y + offset;
  const mid = (a.x + b.x) / 2;
  return `M ${a.x + 64} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${b.x - 64} ${y2}`;
}

const strokeFor: Record<string, string> = {
  bat: "var(--color-wire-bat)",
  ign: "var(--color-wire-ign)",
  acc: "var(--color-ok)",
  a: "var(--color-wire-a)",
  b: "var(--color-wire-b)",
  c: "var(--color-wire-c)",
  gnd: "var(--color-wire-gnd)",
};

function NodeCard({
  node,
  selected,
  dim,
  onSelect,
}: {
  node: SchematicNode;
  selected: boolean;
  dim: boolean;
  onSelect: (id: string) => void;
}) {
  const p = POS[node.id];
  const kindRing =
    node.kind === "fuse"
      ? "stroke-accent"
      : node.kind === "connector"
        ? "stroke-steel"
        : node.kind === "load"
          ? "stroke-ok"
          : "stroke-line";

  return (
    <g
      transform={`translate(${p.x - 64} ${p.y - 28})`}
      className={cn("cursor-pointer transition-opacity", dim && "opacity-30")}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(node.id);
      }}
    >
      <rect
        width="128"
        height="56"
        rx="8"
        className={cn("fill-raised", selected ? "stroke-accent" : kindRing)}
        strokeWidth={selected ? 2 : 1}
      />
      <text
        x="64"
        y="22"
        textAnchor="middle"
        className="fill-fg font-mono"
        style={{ fontSize: 11, fontWeight: 500 }}
      >
        {node.label}
      </text>
      <text x="64" y="40" textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 10 }}>
        {node.sub}
      </text>
    </g>
  );
}

export function CircuitSchematic() {
  const [selected, setSelected] = useState<string>("bulkhead");

  const related = useMemo(() => {
    const ids = new Set<string>([selected]);
    for (const w of schematicWires) {
      if (w.from === selected || w.to === selected || w.id === selected || w.circuit === selected) {
        ids.add(w.from);
        ids.add(w.to);
        ids.add(w.id);
      }
    }
    return ids;
  }, [selected]);

  const node = schematicNodes.find((n) => n.id === selected);
  const wire = schematicWires.find((w) => w.id === selected);
  const legend = circuit19Legend.find((l) => l.id === selected);

  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs tracking-widest text-accent uppercase">Circuit 19</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-fg">
            Fuel filter / heater path
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
            Tap a box or a wire. A2=19J and D2=19D stay in the cab on FUEL FILTER (399). Only
            19A / 19B / 19C cross DASH CONNECTOR (2). B1 is Allison 92D, not this circuit.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelected("bulkhead")}
          className="rounded-sm border border-line px-3 py-2 text-xs font-medium text-muted hover:border-accent hover:text-fg"
        >
          Reset to firewall
        </button>
      </header>

      <ZoomStage>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block max-w-none"
          role="img"
          aria-label="Circuit 19 wiring schematic"
          onClick={() => setSelected("bulkhead")}
        >
          <rect width={W} height={H} className="fill-surface" />
          <text x="24" y="18" className="fill-subtle font-mono" style={{ fontSize: 10 }}>
            CAB SIDE
          </text>
          <text x="1180" y="18" className="fill-subtle font-mono" style={{ fontSize: 10 }}>
            ENGINE SIDE
          </text>
          <line
            x1="540"
            y1="16"
            x2="540"
            y2="324"
            stroke="var(--color-line)"
            strokeDasharray="4 6"
          />
          <text x="546" y="328" className="fill-subtle font-mono" style={{ fontSize: 9 }}>
            FIREWALL
          </text>

          {schematicWires.map((w, i) => {
            const off = w.circuit.startsWith("19A")
              ? -8
              : w.circuit.startsWith("19B")
                ? 0
                : w.circuit.startsWith("19C")
                  ? 8
                  : (i % 3) - 1;
            const active = related.has(w.id) || related.has(w.from) || related.has(w.to);
            const dim = selected !== "bulkhead" && !active && !related.has(w.from);
            return (
              <path
                key={w.id}
                d={pathBetween(w.from, w.to, off * 4)}
                fill="none"
                stroke={strokeFor[w.color]}
                strokeWidth={active ? 2.4 : 1.4}
                className={cn("cursor-pointer", dim && "opacity-25")}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(w.id);
                }}
              />
            );
          })}

          {schematicNodes.map((n) => (
            <NodeCard
              key={n.id}
              node={n}
              selected={selected === n.id}
              dim={selected !== n.id && !related.has(n.id) && selected !== "bulkhead"}
              onSelect={setSelected}
            />
          ))}
        </svg>
      </ZoomStage>

      <div className="grid gap-3 sm:grid-cols-3">
        {circuit19Legend.map((row) => (
          <button
            key={row.id}
            type="button"
            onClick={() => setSelected(row.id)}
            className={cn(
              "rounded-md border px-4 py-3 text-left transition-colors",
              selected === row.id
                ? "border-accent bg-raised"
                : "border-border bg-surface hover:border-line",
            )}
          >
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-mono text-sm text-fg">{row.id}</span>
              <span className="font-mono text-xs text-muted">cavity {row.cavity}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted">{row.note}</p>
          </button>
        ))}
      </div>

      <aside className="rounded-lg border border-border bg-raised px-5 py-4">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Selected</p>
        <h3 className="mt-1 font-display text-2xl font-semibold text-fg">
          {node?.label ?? wire?.label ?? legend?.id ?? selected}
        </h3>
        {node?.page ? (
          <p className="mt-1 font-mono text-xs text-muted">Manual printed page {node.page}</p>
        ) : null}
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          {node?.detail ??
            wire?.label ??
            legend?.note ??
            "Select a node or a Circuit 19 conductor."}
        </p>
        {wire ? (
          <p className="mt-2 font-mono text-xs text-steel">
            {wire.from} → {wire.to} · {wire.circuit}
          </p>
        ) : null}
      </aside>
    </section>
  );
}
