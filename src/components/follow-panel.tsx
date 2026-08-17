import { circuitToggles } from "@/data/world";
import { followTitle, hopsForCircuit, type Hop } from "@/data/follow";
import { i6Only } from "@/data/engine";
import { cn } from "@/lib/utils";

export function FollowPanel({
  circuit,
  hopWireId,
  onCircuit,
  onHop,
}: {
  circuit: string | null;
  hopWireId: string | null;
  onCircuit: (id: string) => void;
  onHop: (hop: Hop) => void;
}) {
  const hops = circuit ? hopsForCircuit(circuit) : [];
  const title = circuit ? followTitle(circuit) : "";

  return (
    <div className="rounded-md border border-border bg-surface">
      <div className="border-b border-border px-3 py-2">
        <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">Follow a circuit</p>
        <label className="mt-2 block">
          <span className="sr-only">Circuit</span>
          <select
            className="h-11 w-full rounded-xs border border-border bg-raised px-2 font-mono text-sm text-fg"
            value={circuit ?? ""}
            onChange={(e) => onCircuit(e.target.value)}
          >
            <option value="">Pick a circuit…</option>
            {circuitToggles.map((c) => (
              <option key={c.id} value={c.id}>
                {c.id} · {c.title}
                {c.crit ? " · RUN" : ""}
              </option>
            ))}
          </select>
        </label>
        {circuit ? (
          <p className="mt-2 text-sm text-muted">
            {i6Only.has(circuit)
              ? "I6-HEUI only. Your 7.3 T444E does not use this. Use GLOW PLUGS/PRE-HEATER (18) for cold start."
              : `Circuit ${circuit} · ${title}. Tap a hop to walk it.`}
          </p>
        ) : null}
      </div>
      {hops.length ? (
        <ol className="max-h-64 overflow-y-auto">
          {hops.map((h) => (
            <li key={h.wireId} className="border-b border-border last:border-0">
              <button
                type="button"
                onClick={() => onHop(h)}
                className={cn(
                  "flex w-full items-start gap-2 px-3 py-2 text-left text-sm",
                  hopWireId === h.wireId ? "bg-raised text-fg" : "text-muted hover:text-fg",
                )}
              >
                <span className="mt-0.5 w-5 shrink-0 font-mono text-xs text-accent">{h.i}</span>
                <span className="min-w-0 flex-1">
                  <span className="block leading-snug text-fg">{h.fromLabel}</span>
                  <span className="block text-xs leading-snug">→ {h.toLabel}</span>
                  <span className="mt-0.5 block font-mono text-[10px] text-subtle">
                    {h.pin !== "—" ? `${h.pin} · ` : ""}
                    {h.circuit}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="px-3 py-3 text-sm text-muted">
          Pick any circuit in the list. Every named circuit from the book can be walked hop by hop.
        </p>
      )}
    </div>
  );
}
