import { fuses, relays, sourceLabel } from "@/data/wiring";
import { cn } from "@/lib/utils";

export function CircuitTable({ query }: { query: string }) {
  const q = query.trim().toLowerCase();
  const match = (s: string) => !q || s.toLowerCase().includes(q);

  const fuseRows = fuses.filter(
    (f) =>
      match(f.id) ||
      match(f.cover) ||
      match(f.description) ||
      match(f.notes) ||
      match(sourceLabel[f.source]) ||
      (f.relay ? match(f.relay) : false),
  );
  const relayRows = relays.filter(
    (r) => match(r.name) || match(r.id) || match(r.notes) || match(r.fused),
  );

  const crit = fuseRows.filter((f) => f.engineCritical);
  const rest = fuseRows.filter((f) => !f.engineCritical);

  return (
    <div className="space-y-8">
      <Group title="Engine critical" rows={crit} />
      <Group title="Not required to run the engine" rows={rest} />

      <div>
        <h3 className="mb-3 font-display text-2xl font-semibold">Cab relays</h3>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Relay</th>
                <th className="px-3 py-2 font-medium">Fused?</th>
                <th className="px-3 py-2 font-medium">Load</th>
                <th className="px-3 py-2 font-medium">Coil</th>
                <th className="px-3 py-2 font-medium">Critical</th>
              </tr>
            </thead>
            <tbody>
              {relayRows.map((r) => (
                <tr key={r.id} className="border-t border-border">
                  <td className="px-3 py-2.5">
                    <div className="text-fg">{r.name}</div>
                    <div className="font-mono text-xs text-subtle">{r.id}</div>
                  </td>
                  <td className="px-3 py-2.5 text-muted">{r.fused}</td>
                  <td className="px-3 py-2.5 text-muted">{r.loadSide}</td>
                  <td className="px-3 py-2.5 text-muted">{r.coilSide}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn(r.engineCritical ? "text-accent" : "text-subtle")}>
                      {r.engineCritical ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Group({ title, rows }: { title: string; rows: typeof fuses }) {
  if (rows.length === 0) return null;
  return (
    <div>
      <h3 className="mb-3 font-display text-2xl font-semibold">{title}</h3>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-surface text-xs tracking-wide text-muted uppercase">
            <tr>
              <th className="px-3 py-2 font-medium">Loc</th>
              <th className="px-3 py-2 font-medium">Size</th>
              <th className="px-3 py-2 font-medium">Power</th>
              <th className="px-3 py-2 font-medium">Description</th>
              <th className="px-3 py-2 font-medium">Relay</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((f) => (
              <tr key={f.id} className="border-t border-border align-top">
                <td className="px-3 py-2.5 font-mono text-fg">
                  {f.id}
                  <div className="text-[10px] text-subtle">{f.cover}</div>
                </td>
                <td className="px-3 py-2.5 font-mono text-fg">{f.size}</td>
                <td className="px-3 py-2.5 text-muted">{sourceLabel[f.source]}</td>
                <td className="px-3 py-2.5">
                  <div className="text-fg">{f.description}</div>
                  <div className="mt-1 text-xs leading-relaxed text-subtle">{f.notes}</div>
                </td>
                <td className="px-3 py-2.5 text-muted">{f.relay ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
