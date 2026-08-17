import { useEffect, useMemo, useState } from "react";
import { FlowSchematic } from "@/components/flow-schematic";
import { FollowPanel } from "@/components/follow-panel";
import { flowMaps } from "@/data/schematics";
import { cn } from "@/lib/utils";

export function AllCircuits({ query, focus }: { query: string; focus?: string | null }) {
  const [id, setId] = useState(focus ?? "19");
  const [hopWireId, setHopWireId] = useState<string | null>(null);

  useEffect(() => {
    if (!focus) return;
    const next = flowMaps.find((m) => m.id === focus || m.number === focus);
    if (next) setId(next.id);
  }, [focus]);
  const q = query.trim().toLowerCase();
  const list = useMemo(
    () =>
      flowMaps.filter(
        (m) =>
          !q ||
          m.number.includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.blurb.toLowerCase().includes(q) ||
          (m.engineCritical && "engine".includes(q)),
      ),
    [q],
  );
  const crit = list.filter((m) => m.engineCritical);
  const rest = list.filter((m) => !m.engineCritical);
  const map = flowMaps.find((m) => m.id === id) ?? list[0] ?? flowMaps[0];
  const followId = map.number.match(/^\d+/)?.[0] ?? map.id;

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="order-2 min-w-0 space-y-4 lg:order-none">
        <FollowPanel
          circuit={followId}
          hopWireId={hopWireId}
          onCircuit={(cid) => {
            const next = flowMaps.find((m) => m.id === cid || m.number === cid);
            if (next) setId(next.id);
            setHopWireId(null);
          }}
          onHop={(h) => setHopWireId(h.wireId)}
        />
        <Group title="Needed to run" items={crit} active={map.id} onPick={(next) => { setId(next); setHopWireId(null); }} />
        <Group title="Not needed to run" items={rest} active={map.id} onPick={(next) => { setId(next); setHopWireId(null); }} />
      </aside>
      <div className="order-1 min-w-0 lg:order-none">
        <FlowSchematic key={map.id} map={map} />
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
  items: typeof flowMaps;
  active: string;
  onPick: (id: string) => void;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] tracking-widest text-subtle uppercase">{title}</p>
      <div className="flex flex-col gap-1">
        {items.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick(m.id)}
            className={cn(
              "rounded-sm border px-2.5 py-2 text-left text-sm transition-colors",
              m.id === active
                ? "border-accent bg-raised text-fg"
                : "border-transparent bg-surface text-muted hover:border-line hover:text-fg",
            )}
          >
            <span className="font-mono text-[10px] text-accent">{m.number}</span>
            <div className="leading-snug">{m.title}</div>
          </button>
        ))}
      </div>
    </div>
  );
}