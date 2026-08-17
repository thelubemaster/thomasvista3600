import { useMemo, useState } from "react";
import type { FlowMap, FlowNode } from "@/data/schematics";
import { relayFaces } from "@/data/relay-pins";
import { ZoomStage } from "@/components/zoom-stage";
import { cn } from "@/lib/utils";

const strokeFor: Record<string, string> = {
  bat: "var(--color-wire-bat)",
  ign: "var(--color-wire-ign)",
  acc: "var(--color-ok)",
  a: "var(--color-wire-a)",
  b: "var(--color-wire-b)",
  c: "var(--color-wire-c)",
  gnd: "var(--color-wire-gnd)",
};

function pathBetween(from: FlowNode, to: FlowNode, offset = 0) {
  const y1 = from.y + offset;
  const y2 = to.y + offset;
  const mid = (from.x + to.x) / 2;
  return `M ${from.x + 64} ${y1} C ${mid} ${y1}, ${mid} ${y2}, ${to.x - 64} ${y2}`;
}

function NodeCard({
  node,
  selected,
  dim,
  onSelect,
}: {
  node: FlowNode;
  selected: boolean;
  dim: boolean;
  onSelect: (id: string) => void;
}) {
  const isGnd = /ground/i.test(node.label);
  const kindRing =
    isGnd
      ? "stroke-[var(--color-wire-gnd)]"
      : node.kind === "fuse"
        ? "stroke-accent"
        : node.kind === "connector"
          ? "stroke-steel"
          : node.kind === "load"
            ? "stroke-ok"
            : node.kind === "relay"
              ? "stroke-warn"
              : "stroke-line";

  return (
    <g
      transform={`translate(${node.x - 64} ${node.y - 28})`}
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
        className={cn(isGnd ? "fill-[#3a3832]" : "fill-raised", selected ? "stroke-accent" : kindRing)}
        strokeWidth={selected ? 2 : 1}
      />
      <text x="64" y="22" textAnchor="middle" className="fill-fg font-mono" style={{ fontSize: 13, fontWeight: 500 }}>
        {node.label}
      </text>
      <text x="64" y="42" textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 11 }}>
        {node.sub}
      </text>
    </g>
  );
}

function Face({ node }: { node: FlowNode }) {
  const face = node.relayId ? relayFaces.find((r) => r.id === node.relayId) : undefined;
  if (face) {
    return (
      <div className="mt-4 space-y-3">
        <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">
          Mating end · {face.look}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {face.pins.map((p) => (
            <div key={p.id} className="rounded-sm border border-line bg-bg px-3 py-2">
              <p className="font-mono text-sm text-accent">
                {p.iso} · {p.circuit}
              </p>
              <p className="text-xs text-fg">{p.role}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{p.goes}</p>
              <p className="mt-1 font-mono text-[10px] text-subtle">{p.power}</p>
            </div>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted">{face.more}</p>
      </div>
    );
  }
  const pins = node.pins ?? "";
  if (node.kind === "connector" || node.kind === "module") {
    const cells = pins.includes("–") || pins.includes("-") || pins.includes("/") || pins.includes(" ")
      ? pins.split(/[\s/–-]+/).filter(Boolean).slice(0, 12)
      : pins.length <= 3
        ? [pins]
        : pins.split("").slice(0, 12);
    return (
      <div className="mt-3 rounded-md border border-line bg-bg p-3">
        <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">What it looks like</p>
        <p className="mt-1 text-sm text-fg">{node.look}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {(cells.length ? cells : ["·"]).map((c) => (
            <span
              key={c}
              className="grid size-8 place-items-center rounded-xs border border-line bg-raised font-mono text-[10px] text-muted"
            >
              {c}
            </span>
          ))}
        </div>
      </div>
    );
  }
  return node.look ? (
    <p className="mt-3 text-sm text-muted">
      <span className="font-mono text-[10px] tracking-widest text-subtle uppercase">Looks like · </span>
      {node.look}
    </p>
  ) : null;
}

export function FlowSchematic({ map }: { map: FlowMap }) {
  const [selected, setSelected] = useState(map.defaultId);
  const W = map.width ?? 1320;
  const H = map.height ?? 360;
  const byId = Object.fromEntries(map.nodes.map((n) => [n.id, n]));

  const related = useMemo(() => {
    const ids = new Set<string>([selected]);
    for (const w of map.wires) {
      if (w.from === selected || w.to === selected || w.id === selected || w.circuit === selected) {
        ids.add(w.from);
        ids.add(w.to);
        ids.add(w.id);
      }
    }
    return ids;
  }, [map.wires, selected]);

  const node = map.nodes.find((n) => n.id === selected);
  const wire = map.wires.find((w) => w.id === selected);
  const legend = map.legend?.find((l) => l.id === selected);

  return (
    <section className="space-y-3 sm:space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-2 sm:gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] tracking-widest text-accent uppercase sm:text-xs">
            Circuit {map.number}
            {map.engineCritical ? " · engine critical" : " · not needed to run"}
          </p>
          <h2 className="font-display text-xl font-semibold tracking-tight text-fg sm:text-3xl">{map.title}</h2>
          <p className="mt-1 line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted sm:line-clamp-none">{map.blurb}</p>
        </div>
        <button
          type="button"
          onClick={() => setSelected(map.defaultId)}
          className="h-11 shrink-0 rounded-sm border border-line px-3 text-sm font-medium text-muted hover:border-accent hover:text-fg sm:h-auto sm:py-2 sm:text-xs"
        >
          Reset
        </button>
      </header>

      <ZoomStage>
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block max-w-none"
          role="img"
          aria-label={`Circuit ${map.number} schematic`}
          onClick={() => setSelected(map.defaultId)}
        >
          <rect width={W} height={H} className="fill-surface" />
          <text x="24" y="18" className="fill-subtle font-mono" style={{ fontSize: 10 }}>
            {map.cabLabel ?? "CAB"}
          </text>
          {map.firewallX ? (
            <>
              <line
                x1={map.firewallX}
                y1="16"
                x2={map.firewallX}
                y2={H - 16}
                stroke="var(--color-line)"
                strokeDasharray="4 6"
              />
              <text x={map.firewallX + 6} y={H - 12} className="fill-subtle font-mono" style={{ fontSize: 9 }}>
                FIREWALL
              </text>
            </>
          ) : null}

          {map.wires.map((w, i) => {
            const a = byId[w.from];
            const b = byId[w.to];
            if (!a || !b) return null;
            const off = (i % 5) - 2;
            const active = related.has(w.id) || related.has(w.from) || related.has(w.to);
            const dim = selected !== map.defaultId && !active;
            return (
              <path
                key={w.id}
                d={pathBetween(a, b, off * 3)}
                fill="none"
                stroke={strokeFor[w.color]}
                strokeWidth={active ? 3.2 : 2.1}
                className={cn("cursor-pointer", dim && "opacity-25")}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected(w.id);
                }}
              />
            );
          })}

          {map.nodes.map((n) => (
            <NodeCard
              key={n.id}
              node={n}
              selected={selected === n.id}
              dim={selected !== n.id && !related.has(n.id) && selected !== map.defaultId}
              onSelect={setSelected}
            />
          ))}
        </svg>
      </ZoomStage>

      <ol className="grid gap-2 sm:grid-cols-2">
        {map.wires.map((w, i) => {
          const a = byId[w.from];
          const b = byId[w.to];
          return (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => setSelected(w.id)}
                className={cn(
                  "flex w-full items-start gap-2 rounded-md border px-3 py-2 text-left",
                  selected === w.id ? "border-accent bg-raised" : "border-border bg-surface hover:border-line",
                )}
              >
                <span className="font-mono text-xs text-accent">{i + 1}</span>
                <span className="min-w-0">
                  <span className="block text-sm text-fg">{a?.label ?? w.from}</span>
                  <span className="block text-xs text-muted">→ {b?.label ?? w.to}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-subtle">{w.label ?? w.circuit}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {map.legend?.length ? (
        <div className="grid gap-3 sm:grid-cols-3">
          {map.legend.map((row) => (
            <button
              key={row.id}
              type="button"
              onClick={() => setSelected(row.id)}
              className={cn(
                "rounded-md border px-4 py-3 text-left transition-colors",
                selected === row.id ? "border-accent bg-raised" : "border-border bg-surface hover:border-line",
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-mono text-sm text-fg">{row.id}</span>
                <span className="font-mono text-xs text-muted">{row.cavity}</span>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-muted">{row.note}</p>
            </button>
          ))}
        </div>
      ) : null}

      <aside className="rounded-lg border border-border bg-raised px-5 py-4">
        <p className="font-mono text-xs tracking-widest text-accent uppercase">Selected</p>
        <h3 className="mt-1 font-display text-2xl font-semibold text-fg">
          {node?.label ?? wire?.label ?? legend?.id ?? selected}
        </h3>
        {node?.page ? <p className="mt-1 font-mono text-xs text-muted">Manual printed page {node.page}</p> : null}
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted">
          {node?.detail ?? wire?.label ?? legend?.note ?? "Tap a box or a wire."}
        </p>
        {wire ? (
          <p className="mt-2 font-mono text-xs text-steel">
            {wire.from} → {wire.to} · {wire.circuit}
          </p>
        ) : null}
        {node ? <Face node={node} /> : null}
      </aside>
    </section>
  );
}
