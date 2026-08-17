import { useEffect, useMemo, useState } from "react";
import { findCircuitHits } from "@/data/connectors";
import { extraFor } from "@/data/circuit-extra";
import { circuitLabel } from "@/data/circuits";
import { relayFaces, type RelayFace } from "@/data/relay-pins";
import { flowMaps } from "@/data/schematics";
import { FlowSchematic } from "@/components/flow-schematic";
import { cn } from "@/lib/utils";

export function RelayPanel({ focus }: { focus?: string | null }) {
  const [id, setId] = useState(focus ?? "387");
  const [pinId, setPinId] = useState("3");

  useEffect(() => {
    if (!focus) return;
    const next = relayFaces.find((r) => r.id === focus || r.tag === focus);
    if (next) {
      setId(next.id);
      setPinId(next.pins[0]?.id ?? "4");
    }
  }, [focus]);
  const face = relayFaces.find((r) => r.id === id) ?? relayFaces[0];
  const pin = face.pins.find((p) => p.id === pinId) ?? face.pins[0];
  const extra = extraFor(pin.circuit);
  const map = flowMaps.find((m) => m.id === (pin.circuit.match(/\d+/)?.[0] ?? ""));
  const hits = useMemo(() => findCircuitHits(pin.circuit.split(" ")[0]), [pin.circuit]);

  const crit = relayFaces.filter((r) => r.engineCritical);
  const rest = relayFaces.filter((r) => !r.engineCritical);

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="order-2 space-y-4 lg:order-none">
        <Group title="Needed to run / start" items={crit} active={face.id} onPick={(rid) => { setId(rid); setPinId(relayFaces.find((r) => r.id === rid)?.pins[0].id ?? "4"); }} />
        <Group title="Not needed to run" items={rest} active={face.id} onPick={(rid) => { setId(rid); setPinId(relayFaces.find((r) => r.id === rid)?.pins[0].id ?? "4"); }} />
      </aside>

      <div className="order-1 min-w-0 space-y-5 lg:order-none">
        <header>
          <p className="font-mono text-[10px] tracking-widest text-accent uppercase sm:text-xs">
            Relay {face.tag} · printed page {face.page}
            {face.engineCritical ? " · engine critical" : ""}
          </p>
          <h2 className="font-display text-xl font-semibold tracking-tight sm:text-3xl">{face.name}</h2>
          <p className="mt-1 text-sm text-muted">{face.where}. {face.look}</p>
        </header>

        <div className="grid gap-4 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <RelaySocket face={face} pinId={pin.id} onPick={setPinId} />
          <aside className="rounded-lg border border-border bg-raised p-4">
            <p className="font-mono text-xs tracking-widest text-accent uppercase">
              Pin {pin.id} · ISO {pin.iso} · {pin.circuit}
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold">{pin.role}</h3>
            <p className="mt-1 text-sm text-muted">{pin.goes}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="font-mono text-[10px] tracking-widest text-subtle uppercase">Power</dt>
                <dd>{pin.power}</dd>
              </div>
              <div>
                <dt className="font-mono text-[10px] tracking-widest text-subtle uppercase">Fused</dt>
                <dd>{face.fused}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-mono text-[10px] tracking-widest text-subtle uppercase">This circuit</dt>
                <dd>{circuitLabel(pin.circuit)}</dd>
              </div>
            </dl>
            {extra ? (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                <span className="font-mono text-[10px] tracking-widest text-subtle uppercase">If you cut it · </span>
                {extra.ifCut}
              </p>
            ) : null}
            <p className="mt-3 text-sm leading-relaxed text-muted">{face.more}</p>
          </aside>
        </div>

        <section>
          <p className="mb-2 font-mono text-[10px] tracking-widest text-subtle uppercase">
            Whole circuit {pin.circuit} · {hits.length} other pins
          </p>
          <ul className="grid gap-1 sm:grid-cols-2">
            {hits.map((h) => (
              <li key={`${h.connector.id}-${h.pin.cavity}`} className="rounded-sm px-2 py-1.5 text-sm">
                <span className="font-mono text-accent">
                  {h.connector.tag}-{h.pin.cavity}
                </span>
                <span className="text-muted"> · {h.connector.name}</span>
                <span className="block font-mono text-xs text-steel">
                  {h.pin.circuit} — {h.pin.dest}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {map ? <FlowSchematic key={`${map.id}-${pin.circuit}`} map={map} /> : null}
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
  items: RelayFace[];
  active: string;
  onPick: (id: string) => void;
}) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] tracking-widest text-subtle uppercase">{title}</p>
      <div className="flex flex-col gap-1">
        {items.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onPick(r.id)}
            className={cn(
              "rounded-sm border px-2.5 py-2 text-left text-sm transition-colors",
              r.id === active ? "border-accent bg-raised text-fg" : "border-transparent bg-surface text-muted hover:border-line hover:text-fg",
            )}
          >
            <span className="font-mono text-[10px] text-accent">{r.tag}</span>
            <div className="leading-snug">{r.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function RelaySocket({
  face,
  pinId,
  onPick,
}: {
  face: RelayFace;
  pinId: string;
  onPick: (id: string) => void;
}) {
  const by = Object.fromEntries(face.pins.map((p) => [p.id, p]));
  if (face.layout === "flash2") {
    return (
      <div className="rounded-lg border border-[#c9c2b4] bg-[#f4f0e6] p-4 text-[#1a1814]">
        <p className="mb-2 font-mono text-[10px] tracking-widest uppercase opacity-70">FLASHER (R1) · two blades</p>
        <div className="flex justify-center gap-8">
          {(["A", "B"] as const).map((id) => {
            const p = by[id];
            const on = pinId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onPick(id)}
                className={cn(
                  "grid size-16 place-items-center border-2 border-[#1a1814] font-mono text-xs",
                  on ? "bg-accent text-accent-fg" : "bg-[#f4f0e6]",
                )}
              >
                {p?.circuit ?? id}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm">Round can in the fuse-panel lid. Two blades only.</p>
      </div>
    );
  }
  if (face.layout === "iso5") {
    const five = [
      { id: "4", iso: "87", className: "col-start-1" },
      { id: "5", iso: "30", className: "col-start-3" },
      { id: "3", iso: "85", className: "col-start-1 row-start-2" },
      { id: "2", iso: "87a", className: "col-start-2 row-start-2" },
      { id: "1", iso: "86", className: "col-start-3 row-start-2" },
    ];
    return (
      <div className="rounded-lg border border-[#c9c2b4] bg-[#f4f0e6] p-4 text-[#1a1814]">
        <p className="mb-2 font-mono text-[10px] tracking-widest uppercase opacity-70">Mating end · 5-cavity</p>
        <div className="mx-auto grid w-48 grid-cols-3 grid-rows-2 gap-1 rounded-sm border-2 border-[#1a1814] p-2">
          {five.map((c) => {
            const p = by[c.id] ?? face.pins.find((x) => x.iso === c.iso);
            const on = pinId === c.id || pinId === p?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onPick(p?.id ?? c.id)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center border border-[#1a1814] font-mono text-[10px]",
                  c.className,
                  on ? "bg-accent text-accent-fg" : "bg-[#f4f0e6]",
                )}
              >
                <span className="opacity-70">{c.id}</span>
                <span className="font-semibold">{p?.circuit ?? "—"}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm">Five blades. Empty cavity is unused on this chassis.</p>
      </div>
    );
  }
  const cells = [
    { id: "4", iso: "30" },
    { id: "3", iso: "87" },
    { id: "1", iso: "86" },
    { id: "2", iso: "85" },
  ];
  return (
    <div className="rounded-lg border border-[#c9c2b4] bg-[#f4f0e6] p-4 text-[#1a1814]">
      <p className="mb-2 font-mono text-[10px] tracking-widest uppercase opacity-70">
        Mating end · 4-3 / 1-2 like the book
      </p>
      <div className="mx-auto grid w-40 grid-cols-2 gap-1 rounded-sm border-2 border-[#1a1814] bg-[#f4f0e6] p-2">
        {cells.map((c) => {
          const p = by[c.id];
          const on = pinId === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(c.id)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center border border-[#1a1814] font-mono text-xs",
                on ? "bg-accent text-accent-fg" : "bg-[#f4f0e6]",
              )}
            >
              <span className="text-[10px] opacity-70">{c.id}</span>
              <span className="font-semibold">{p?.circuit ?? "—"}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm">Small black cube. Four square holes. Numbers 4 and 3 on top, 1 and 2 on the bottom.</p>
    </div>
  );
}
