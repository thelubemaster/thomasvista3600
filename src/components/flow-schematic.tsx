import { useMemo, useRef, useState } from "react";
import type { FlowMap, FlowNode } from "@/data/schematics";
import { routeWire } from "@/lib/wire-route";
import { ZoomStage } from "@/components/zoom-stage";
import { PartInspect } from "@/components/part-inspect";
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

function NodeCard({ node, selected, dim }: { node: FlowNode; selected: boolean; dim: boolean }) {
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
      data-node={node.id}
    >
      <rect x={-16} y={-16} width={160} height={88} fill="transparent" />
      <rect
        width="128"
        height="56"
        rx="8"
        className={cn(isGnd ? "fill-[#3a3832]" : "fill-raised", selected ? "stroke-accent" : kindRing)}
        strokeWidth={selected ? 2.4 : 1.2}
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

function chipTag(node: FlowNode) {
  const paren = node.label.match(/\(([^)]+)\)/);
  if (paren) return paren[1];
  const fuse = node.label.match(/FUSE\s+([A-H]\d)/i);
  if (fuse) return fuse[1].toUpperCase();
  if (node.relayId) return node.relayId;
  return node.label.replace(/\s+/g, " ").slice(0, 12);
}

function pickIdAt(x: number, y: number): string | null {
  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (!(el instanceof Element)) continue;
    const node = el.closest("[data-node]");
    const nid = node?.getAttribute("data-node");
    if (nid) return nid;
    const wire = el.closest("[data-wire]");
    const wid = wire?.getAttribute("data-wire");
    if (wid) return wid;
  }
  return null;
}

export function FlowSchematic({ map }: { map: FlowMap }) {
  const [selected, setSelected] = useState<string | null>(null);
  const inspectRef = useRef<HTMLDivElement>(null);
  const W = map.width ?? 1320;
  const H = map.height ?? 360;
  const byId = Object.fromEntries(map.nodes.map((n) => [n.id, n]));
  const parts = useMemo(
    () => map.nodes.filter((n) => n.kind === "connector" || n.kind === "relay" || n.kind === "fuse" || n.kind === "module"),
    [map.nodes],
  );

  const related = useMemo(() => {
    const ids = new Set<string>();
    if (!selected) return ids;
    ids.add(selected);
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
  const inspectOpen = Boolean(selected && (node || wire));

  function select(id: string) {
    setSelected(id);
    requestAnimationFrame(() => {
      inspectRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  }

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
        {selected ? (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="h-11 shrink-0 rounded-sm border border-line px-3 text-sm font-medium text-muted hover:border-accent hover:text-fg sm:h-auto sm:py-2 sm:text-xs"
          >
            Reset
          </button>
        ) : null}
      </header>

      <ZoomStage
        onTap={(x, y) => {
          const id = pickIdAt(x, y);
          if (id) select(id);
        }}
      >
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block max-w-none"
          role="img"
          aria-label={`Circuit ${map.number} schematic`}
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

          {map.wires.map((w) => {
            const a = byId[w.from];
            const b = byId[w.to];
            if (!a || !b) return null;
            const siblings = map.wires.filter((x) => x.from === w.from && x.to === w.to);
            const lane = siblings.length > 1 ? (siblings.indexOf(w) - (siblings.length - 1) / 2) * 12 : 0;
            const d = routeWire(a, b, map.nodes, lane, { w: W, h: H });
            const active = !selected || related.has(w.id) || related.has(w.from) || related.has(w.to);
            const dim = Boolean(selected) && !active;
            return (
              <g key={w.id} className={cn("cursor-pointer", dim && "opacity-25")} data-wire={w.id}>
                <path d={d} fill="none" stroke="transparent" strokeWidth={16} />
                <path d={d} fill="none" stroke={strokeFor[w.color]} strokeWidth={active && selected ? 3.2 : 2.1} />
              </g>
            );
          })}

          {map.nodes.map((n) => (
            <NodeCard
              key={n.id}
              node={n}
              selected={selected === n.id}
              dim={Boolean(selected) && selected !== n.id && !related.has(n.id)}
            />
          ))}
        </svg>
      </ZoomStage>

      <div className="rounded-sm border border-border bg-raised px-2 py-1.5">
        <div className="mb-1 flex items-center justify-between gap-2">
          <p className="min-w-0 truncate font-mono text-[10px] tracking-wide text-accent uppercase">
            {inspectOpen
              ? node
                ? `${node.page ? `p.${node.page} · ` : ""}${node.label}`
                : `Wire ${wire?.circuit}`
              : "Tap a connector or relay — pinout opens below"}
          </p>
        </div>
        <div className="flex gap-1 overflow-x-auto">
          {parts.map((n) => (
            <button
              key={n.id}
              type="button"
              data-part-chip={n.id}
              onClick={() => select(n.id)}
              className={cn(
                "h-11 shrink-0 rounded-xs border px-3 font-mono text-xs",
                selected === n.id ? "border-accent bg-accent text-accent-fg" : "border-border text-muted",
              )}
            >
              {chipTag(n)}
            </button>
          ))}
        </div>
      </div>

      {inspectOpen ? (
        <div ref={inspectRef}>
          <PartInspect map={map} node={node} wire={wire} onPickNode={select} onClose={() => setSelected(null)} />
        </div>
      ) : null}

      <ol className="grid gap-2 sm:grid-cols-2">
        {map.wires.map((w, i) => {
          const a = byId[w.from];
          const b = byId[w.to];
          return (
            <li key={w.id}>
              <button
                type="button"
                onClick={() => select(w.id)}
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
              onClick={() => select(row.id)}
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
    </section>
  );
}
