import { useMemo, useState } from "react";
import { FlowSchematic } from "@/components/flow-schematic";
import { manual, manualSections, type ManualEntry } from "@/data/manual";
import { flowMaps } from "@/data/schematics";
import { cn } from "@/lib/utils";

export function Manual({ query }: { query: string }) {
  const [id, setId] = useState("fuel");
  const [filter, setFilter] = useState<"3600" | "hyd" | "engine" | "all">("3600");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return manual.filter((e) => {
      if (filter === "hyd" && e.hyd !== "3600 hyd" && e.hyd !== "3600" && e.hyd !== "all" && e.hyd !== "chart") return false;
      if (filter === "3600" && (e.hyd === "air only" || e.hyd === "3800/4000")) return false;
      if (filter === "engine" && !e.engineCritical) return false;
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.page.includes(q) ||
        e.section.toLowerCase().includes(q) ||
        e.circuits.some((c) => c.toLowerCase().includes(q)) ||
        e.notes.toLowerCase().includes(q)
      );
    });
  }, [filter, query]);

  const entry = manual.find((e) => e.id === id) ?? rows[0] ?? manual[0];
  const map = entry.mapId ? flowMaps.find((m) => m.id === entry.mapId) : undefined;

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="font-mono text-[10px] tracking-widest text-accent uppercase sm:text-xs">CTS-5123V · AE-2811</p>
        <h2 className="font-display text-xl font-semibold tracking-tight sm:text-3xl">Every page in the book</h2>
        <p className="hidden max-w-2xl text-sm leading-relaxed text-muted sm:block">
          Full Electrical Circuit Diagrams index. Tap a line. If we have the path drawn, it opens like circuit 19.
        </p>
        <div className="flex flex-wrap gap-1">
          {(
            [
              ["3600", "3600 + shared"],
              ["hyd", "W/004040 hyd"],
              ["engine", "Engine to run"],
              ["all", "Whole book"],
            ] as const
          ).map(([k, lab]) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={cn(
                "rounded-xs px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider",
                filter === k ? "bg-accent text-accent-fg" : "bg-raised text-muted",
              )}
            >
              {lab}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-6">
        {manualSections.map((sec) => {
          const items = rows.filter((e) => e.section === sec);
          if (!items.length) return null;
          return (
            <section key={sec} className="space-y-2">
              <h3 className="font-mono text-[11px] tracking-[0.18em] text-subtle uppercase">{sec}</h3>
              <ul className="divide-y divide-border overflow-hidden rounded-md border border-border">
                {items.map((e) => (
                  <Row key={e.id} entry={e} active={e.id === entry.id} onPick={() => setId(e.id)} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <article className="space-y-4 rounded-md border border-border bg-surface p-5">
        <p className="font-mono text-[11px] text-accent">
          PRINTED PAGE {entry.page}
          {entry.engineCritical ? " · ENGINE TO RUN" : ""}
          {entry.hyd === "3600 hyd" ? " · W/004040" : ` · ${entry.hyd}`}
        </p>
        <h3 className="font-display text-2xl font-semibold tracking-tight">{entry.title}</h3>
        <p className="text-sm leading-relaxed text-muted">{entry.notes}</p>
        {entry.circuits.length ? (
          <p className="font-mono text-xs text-fg">Circuits {entry.circuits.join(" · ")}</p>
        ) : null}
        {map ? <FlowSchematic key={map.id} map={map} /> : (
          <p className="text-sm text-subtle">
            Chart / connector page — open Pin map or Firewall for the mating-end cavities.
          </p>
        )}
      </article>
    </div>
  );
}

function Row({
  entry,
  active,
  onPick,
}: {
  entry: ManualEntry;
  active: boolean;
  onPick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onPick}
        className={cn(
          "flex w-full min-w-0 items-baseline gap-3 px-3 py-2.5 text-left",
          active ? "bg-raised" : "hover:bg-raised/60",
        )}
      >
        <span className="w-12 shrink-0 font-mono text-xs text-accent">{entry.page}</span>
        <span className="min-w-0 flex-1 text-sm text-fg">{entry.title}</span>
        {entry.engineCritical ? (
          <span className="hidden shrink-0 font-mono text-[10px] tracking-wider text-crit uppercase sm:inline">Engine</span>
        ) : null}
      </button>
    </li>
  );
}
