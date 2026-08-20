import { useEffect, useMemo, useState } from "react";
import { FlowSchematic } from "@/components/flow-schematic";
import { FollowPanel } from "@/components/follow-panel";
import { flowMaps } from "@/data/schematics";
import { circuitToggles } from "@/data/world";
import { cn } from "@/lib/utils";

function mapForCircuit(circuitId: string) {
  const exact =
    flowMaps.find((m) => m.id === circuitId) ??
    flowMaps.find((m) => m.number === circuitId);
  if (exact) return exact;
  return (
    flowMaps.find((m) => {
      const n = m.number.match(/^\d+/)?.[0];
      return n === circuitId;
    }) ?? flowMaps[0]
  );
}

export function AllCircuits({ query, focus }: { query: string; focus?: string | null }) {
  const [circuitId, setCircuitId] = useState(focus ?? "19");
  const [hopWireId, setHopWireId] = useState<string | null>(null);

  useEffect(() => {
    if (!focus) return;
    const hit = circuitToggles.find((c) => c.id === focus);
    if (hit) {
      setCircuitId(hit.id);
      return;
    }
    const map = mapForCircuit(focus);
    const n = map.number.match(/^\d+/)?.[0];
    if (n) setCircuitId(n);
  }, [focus]);

  const q = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      circuitToggles.filter(
        (c) =>
          !q ||
          c.id.includes(q) ||
          c.title.toLowerCase().includes(q) ||
          (c.crit && "engine run critical".includes(q)),
      ),
    [q],
  );
  const crit = list.filter((c) => c.crit);
  const rest = list.filter((c) => !c.crit);
  const map = mapForCircuit(circuitId);

  function pick(next: string) {
    setCircuitId(next);
    setHopWireId(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">
          {list.length} circuits · Navistar CID chart
        </p>
        {q ? <p className="text-xs text-muted">Filtered</p> : null}
      </div>

      <div className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {list.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => pick(c.id)}
            className={cn(
              "shrink-0 rounded-xs border px-2.5 py-2 font-mono text-xs tabular-nums",
              c.id === circuitId
                ? "border-accent bg-accent text-accent-fg"
                : "border-border bg-surface text-muted hover:text-fg",
            )}
            aria-label={`Circuit ${c.id} ${c.title}`}
            title={`${c.id} · ${c.title}`}
          >
            {c.id}
          </button>
        ))}
      </div>

      <div className="grid min-w-0 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="order-2 min-w-0 space-y-4 lg:order-none">
          <FollowPanel
            circuit={circuitId}
            hopWireId={hopWireId}
            onCircuit={pick}
            onHop={(h) => setHopWireId(h.wireId)}
          />
          <div className="space-y-4">
            <Group title="Needed to run" items={crit} active={circuitId} onPick={pick} />
            <Group title="Not needed to run" items={rest} active={circuitId} onPick={pick} />
          </div>
        </aside>
        <div className="order-1 min-w-0 lg:order-none">
          <FlowSchematic key={map.id} map={map} />
        </div>
      </div>
    </div>
  );
}

function Group({
  title,
  items,
  active,
  onPick,
}: {
  title: string;
  items: { id: string; title: string; crit: boolean }[];
  active: string;
  onPick: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] tracking-widest text-subtle uppercase">
        {title}
        <span className="ml-2 text-subtle">({items.length})</span>
      </p>
      <div className="flex flex-col gap-1">
        {items.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c.id)}
            className={cn(
              "rounded-sm border px-2.5 py-2 text-left text-sm transition-colors",
              c.id === active
                ? "border-accent bg-raised text-fg"
                : "border-transparent bg-surface text-muted hover:border-line hover:text-fg",
            )}
          >
            <span className="font-mono text-[10px] text-accent">{c.id}</span>
            <div className="leading-snug">{c.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
