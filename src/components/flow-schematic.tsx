import { useMemo, useRef, useState } from "react";
import type { FlowMap, FlowNode } from "@/data/schematics";
import { isWallStop, readLines, type ReadLine } from "@/data/read-lines";
import { placeWireLabels } from "@/lib/wire-label";
import { polylineToPath, routeMapWires } from "@/lib/wire-route";
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

function NodeCard({
  node,
  selected,
  dim,
  wall,
}: {
  node: FlowNode;
  selected: boolean;
  dim: boolean;
  wall: boolean;
}) {
  if (node.kind === "splice") {
    return (
      <g
        transform={`translate(${node.x} ${node.y})`}
        className={cn("cursor-pointer transition-opacity", dim && "opacity-30")}
        data-node={node.id}
      >
        <circle r="22" fill="transparent" />
        <circle r="14" fill="none" className="stroke-line" strokeWidth={1} strokeOpacity={0.45} />
        <circle r="6.5" className={selected ? "fill-accent stroke-accent" : "fill-fg stroke-line"} strokeWidth={1.2} />
        <text y="24" textAnchor="middle" className="fill-muted font-mono" style={{ fontSize: 9, fontWeight: 600 }}>
          {node.sub ?? "SPLICE"}
        </text>
      </g>
    );
  }

  const isGnd = /ground/i.test(node.label);
  const kindRing =
    isGnd
      ? "stroke-[var(--color-wire-gnd)]"
      : wall
        ? "stroke-accent"
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
        className={cn(isGnd ? "fill-[#3a3832]" : wall ? "fill-[#2a2218]" : "fill-raised", selected ? "stroke-accent" : kindRing)}
        strokeWidth={selected || wall ? 2.4 : 1.2}
      />
      {wall ? (
        <text x="64" y="12" textAnchor="middle" className="fill-accent font-mono" style={{ fontSize: 9, fontWeight: 600 }}>
          WALL
        </text>
      ) : null}
      <text
        x="64"
        y={wall ? 28 : 22}
        textAnchor="middle"
        className="fill-fg font-mono"
        style={{ fontSize: wall ? 12 : 13, fontWeight: 500 }}
      >
        {node.label}
      </text>
      <text x="64" y={wall ? 44 : 42} textAnchor="middle" className="fill-muted font-sans" style={{ fontSize: 11 }}>
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
  const [readCircuit, setReadCircuit] = useState<string | null>(null);
  const inspectRef = useRef<HTMLDivElement>(null);
  const W = map.width ?? 1320;
  const H = map.height ?? 360;
  const parts = useMemo(
    () => map.nodes.filter((n) => n.kind === "connector" || n.kind === "relay" || n.kind === "fuse" || n.kind === "module"),
    [map.nodes],
  );

  const related = useMemo(() => {
    const ids = new Set<string>();
    if (selected) ids.add(selected);
    for (const w of map.wires) {
      const hit =
        (selected && (w.from === selected || w.to === selected || w.id === selected || w.circuit === selected)) ||
        (readCircuit && w.circuit === readCircuit);
      if (hit) {
        ids.add(w.from);
        ids.add(w.to);
        ids.add(w.id);
      }
    }
    return ids;
  }, [map.wires, selected, readCircuit]);

  const drawn = useMemo(() => {
    const routed = routeMapWires(map.nodes, map.wires, { w: W, h: H });
    const items: { w: (typeof map.wires)[number]; pts: { x: number; y: number }[]; d: string }[] = [];
    for (const w of map.wires) {
      const pts = routed.get(w.id);
      if (!pts) continue;
      items.push({ w, pts, d: polylineToPath(pts) });
    }
    const obstacles = map.nodes.map((n) =>
      n.kind === "splice"
        ? { l: n.x - 28, r: n.x + 28, t: n.y - 28, b: n.y + 28 }
        : { l: n.x - 70, r: n.x + 70, t: n.y - 36, b: n.y + 36 },
    );
    if (map.firewallX) {
      obstacles.push({ l: 0, r: W, t: 0, b: 22 });
      obstacles.push({ l: map.firewallX - 4, r: W, t: H - 22, b: H });
    }
    const labels = placeWireLabels(
      items.map((it) => ({
        id: it.w.id,
        pts: it.pts,
        circuit: it.w.circuit,
        note: it.w.label ?? null,
      })),
      obstacles,
      { w: W, h: H },
    );
    const byLab = new Map(labels.map((l) => [l.id, l]));
    return items.map((it) => ({ ...it, lab: byLab.get(it.w.id) ?? null }));
  }, [map, W, H]);

  const node = map.nodes.find((n) => n.id === selected);
  const wire = map.wires.find((w) => w.id === selected);
  const inspectOpen = Boolean(selected && (node || wire));
  const lines = useMemo(() => readLines(map), [map]);
  const activeCircuit = readCircuit ?? wire?.circuit ?? null;

  function select(id: string) {
    setSelected(id);
    const w = map.wires.find((x) => x.id === id);
    if (w) setReadCircuit(w.circuit);
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
        {selected || readCircuit ? (
          <button
            type="button"
            onClick={() => {
              setSelected(null);
              setReadCircuit(null);
            }}
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
          width="100%"
          height="100%"
          viewBox={`0 0 ${W} ${H}`}
          data-drawing-w={W}
          data-drawing-h={H}
          preserveAspectRatio="xMinYMin meet"
          className="block h-full w-full"
          shapeRendering="geometricPrecision"
          textRendering="geometricPrecision"
          role="img"
          aria-label={`Circuit ${map.number} schematic`}
        >
          <rect width={W} height={H} className="fill-surface" />
          {map.firewallX ? (
            <>
              <rect x="0" y="0" width={map.firewallX} height={H} fill="rgba(196,120,58,0.06)" />
              <rect x={map.firewallX} y="0" width={W - map.firewallX} height={H} fill="rgba(143,163,184,0.07)" />
              <line
                x1={map.firewallX}
                y1="16"
                x2={map.firewallX}
                y2={H - 16}
                stroke="var(--color-accent)"
                strokeWidth={1.6}
                strokeDasharray="5 7"
              />
              <text x="20" y="18" className="fill-accent font-mono" style={{ fontSize: 11, fontWeight: 600 }}>
                {map.cabLabel ?? "CAB"}
              </text>
              <text x={map.firewallX + 10} y="18" className="fill-steel font-mono" style={{ fontSize: 11, fontWeight: 600 }}>
                ENGINE
              </text>
              <text x={map.firewallX + 10} y={H - 10} className="fill-accent font-mono" style={{ fontSize: 10 }}>
                FIREWALL — wires cross here only at a plug
              </text>
            </>
          ) : (
            <text x="24" y="18" className="fill-subtle font-mono" style={{ fontSize: 10 }}>
              {map.cabLabel ?? "CAB"}
            </text>
          )}

          {drawn.map(({ w, d }) => {
            const onRead = activeCircuit ? w.circuit === activeCircuit : false;
            const active = !selected && !readCircuit ? true : related.has(w.id) || related.has(w.from) || related.has(w.to) || onRead;
            const dim = Boolean(selected || readCircuit) && !active;
            return (
              <g key={w.id} className={cn("cursor-pointer", dim && "opacity-20")} data-wire={w.id}>
                <path d={d} fill="none" stroke="transparent" strokeWidth={18} />
                <path d={d} fill="none" stroke={strokeFor[w.color]} strokeWidth={active && (selected || onRead) ? 3.4 : 2.1} />
              </g>
            );
          })}

          {map.nodes.map((n) => (
            <NodeCard
              key={n.id}
              node={n}
              wall={isWallStop(n, map.firewallX)}
              selected={selected === n.id}
              dim={Boolean(selected || readCircuit) && selected !== n.id && !related.has(n.id) && !lines.some((l) => l.circuit === activeCircuit && l.stops.some((s) => s.id === n.id))}
            />
          ))}

          {drawn.map(({ w, lab }) => {
            if (!lab) return null;
            const onRead = activeCircuit ? w.circuit === activeCircuit : false;
            const active = !selected && !readCircuit ? true : related.has(w.id) || related.has(w.from) || related.has(w.to) || onRead;
            const dim = Boolean(selected || readCircuit) && !active;
            const color = strokeFor[w.color];
            const bw = lab.box.r - lab.box.l;
            const bh = lab.box.b - lab.box.t;
            return (
              <g key={`lab-${w.id}`} className={cn("cursor-pointer", dim && "opacity-20")} data-wire={w.id}>
                <line
                  x1={lab.attach.x}
                  y1={lab.attach.y}
                  x2={lab.leaderTo.x}
                  y2={lab.leaderTo.y}
                  stroke={color}
                  strokeWidth={1.2}
                />
                <circle cx={lab.attach.x} cy={lab.attach.y} r={2.7} fill={color} stroke="var(--color-surface)" strokeWidth={1.1} />
                <rect
                  x={lab.box.l}
                  y={lab.box.t}
                  width={bw}
                  height={bh}
                  rx={3}
                  fill="transparent"
                  stroke={color}
                  strokeWidth={0.9}
                  strokeOpacity={0.45}
                />
                <text
                  x={lab.textAt.x}
                  y={lab.note ? lab.textAt.y - 5 : lab.textAt.y + 0.5}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-fg font-mono"
                  style={{ fontSize: 11, fontWeight: 700, paintOrder: "stroke", stroke: "var(--color-surface)", strokeWidth: 3, strokeLinejoin: "round" }}
                >
                  {lab.circuit}
                </text>
                {lab.note ? (
                  <text
                    x={lab.textAt.x}
                    y={lab.textAt.y + 7}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-muted font-mono"
                    style={{ fontSize: 8.5, fontWeight: 500, paintOrder: "stroke", stroke: "var(--color-surface)", strokeWidth: 2.5, strokeLinejoin: "round" }}
                  >
                    {lab.note}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>
      </ZoomStage>

      {lines.length ? (
        <div className="space-y-2">
          <p className="font-mono text-[10px] tracking-widest text-accent uppercase">
            Read left to right · cab → wall plug → engine
          </p>
          <p className="text-xs text-muted">Each tag points at one wire. Tap a tag or a hop below to light that circuit.</p>
          <ul className="space-y-1.5">
            {lines.map((line) => (
              <ReadRow
                key={line.circuit}
                line={line}
                active={activeCircuit === line.circuit}
                onPick={(id) => {
                  setReadCircuit(line.circuit);
                  select(id);
                }}
                onFocus={() => {
                  setSelected(null);
                  setReadCircuit(line.circuit);
                }}
              />
            ))}
          </ul>
        </div>
      ) : null}

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

function ReadRow({
  line,
  active,
  onPick,
  onFocus,
}: {
  line: ReadLine;
  active: boolean;
  onPick: (id: string) => void;
  onFocus: () => void;
}) {
  return (
    <li>
      <div
        className={cn(
          "rounded-md border px-3 py-2",
          active ? "border-accent bg-raised" : "border-border bg-surface",
        )}
      >
        <button type="button" onClick={onFocus} className="flex w-full items-center gap-2 text-left">
          <span className="font-mono text-sm font-semibold text-fg">{line.circuit}</span>
          {line.crosses ? (
            <span className="rounded-xs bg-accent px-1.5 py-0.5 font-mono text-[10px] text-accent-fg">through wall</span>
          ) : (
            <span className="font-mono text-[10px] text-subtle">stays this side</span>
          )}
        </button>
        <p className="mt-1.5 flex flex-wrap items-center gap-1 text-sm leading-snug">
          {line.stops.map((s, i) => (
            <span key={s.id} className="inline-flex items-center gap-1">
              {i ? <span className="text-subtle">→</span> : null}
              <button
                type="button"
                onClick={() => onPick(s.id)}
                className={cn(
                  "rounded-xs px-1.5 py-0.5 font-mono text-xs",
                  s.wall ? "bg-accent text-accent-fg" : "text-fg hover:bg-raised",
                )}
              >
                {s.wall ? `plug ${s.name}` : s.name}
              </button>
            </span>
          ))}
        </p>
      </div>
    </li>
  );
}
