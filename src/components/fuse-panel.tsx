import { fuses, sourceLabel, type Fuse } from "@/data/wiring";
import { cn } from "@/lib/utils";

const LAYOUT: { id: string; span?: string }[][] = [
  [{ id: "A1" }, { id: "A2" }],
  [{ id: "G1" }],
  [{ id: "C1" }, { id: "C2" }, { id: "C3" }],
  [{ id: "D1" }, { id: "D2" }, { id: "D3" }],
  [{ id: "E1" }, { id: "E2" }, { id: "E3" }],
  [{ id: "F1" }, { id: "F2" }, { id: "F3" }],
  [{ id: "H1" }],
];

function sourceTone(source: Fuse["source"]) {
  if (source === "battery") return "text-accent";
  if (source === "key") return "text-steel";
  return "text-ok";
}

export function FusePanel({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  const byId = Object.fromEntries(fuses.map((f) => [f.id, f]));
  const active = selected ? byId[selected] : null;

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="rounded-lg border border-border bg-surface p-4 sm:p-5">
        <p className="mb-4 font-mono text-xs tracking-widest text-muted uppercase">
          Cab fuse cover
        </p>
        <div className="space-y-2">
          {LAYOUT.map((row, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              {row.map((cell) => {
                const f = byId[cell.id];
                if (!f) return null;
                const on = selected === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => onSelect(f.id)}
                    className={cn(
                      "min-h-16 rounded-sm border px-3 py-2 text-left transition-colors",
                      on
                        ? "border-accent bg-raised"
                        : "border-line bg-bg hover:border-muted",
                      row.length === 1 && "col-span-2",
                    )}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-xs text-muted">{f.id}</span>
                      <span className="font-mono text-xs text-fg">{f.size}</span>
                    </div>
                    <div className="mt-1 font-display text-lg font-semibold tracking-wide text-fg">
                      {f.cover}
                    </div>
                    <div className={cn("mt-0.5 text-[10px] font-medium tracking-wide uppercase", sourceTone(f.source))}>
                      {sourceLabel[f.source]}
                    </div>
                  </button>
                );
              })}
              {row.length === 1 && i === LAYOUT.length - 1 ? (
                <div className="flex items-center justify-center rounded-full border border-line font-mono text-[10px] tracking-widest text-muted uppercase">
                  Flasher
                </div>
              ) : null}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => onSelect("B1")}
          className={cn(
            "mt-3 w-full rounded-sm border px-3 py-2 text-left",
            selected === "B1" ? "border-accent bg-raised" : "border-line bg-bg hover:border-muted",
          )}
        >
          <span className="font-mono text-xs text-muted">B1 · 20A · Key</span>
          <div className="font-display text-lg font-semibold">Allison 92D / shutter (not on cover)</div>
        </button>
        <p className="mt-4 text-xs leading-relaxed text-subtle">
          Cover labels IGN 15A and AUTO XMSN 15A are the same fuse (G1).
        </p>
      </div>

      <div className="rounded-lg border border-border bg-raised p-5">
        {active ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-muted">{active.id}</span>
              <span className="font-mono text-sm text-fg">{active.size}</span>
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase",
                  active.engineCritical
                    ? "border-accent/50 text-accent"
                    : "border-line text-muted",
                )}
              >
                {active.engineCritical ? "Engine critical" : "Not required to run"}
              </span>
            </div>
            <h3 className="mt-2 font-display text-3xl font-semibold tracking-tight">{active.cover}</h3>
            <p className="mt-1 text-sm text-fg">{active.description}</p>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-subtle">Power</dt>
                <dd className={sourceTone(active.source)}>{sourceLabel[active.source]}</dd>
              </div>
              <div>
                <dt className="text-xs text-subtle">Relay</dt>
                <dd className="text-fg">{active.relay ?? "None on this fuse"}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm leading-relaxed text-muted">{active.notes}</p>
          </>
        ) : (
          <p className="text-sm text-muted">Select a fuse on the cover to see power source, relay, and whether the engine needs it.</p>
        )}
      </div>
    </div>
  );
}
