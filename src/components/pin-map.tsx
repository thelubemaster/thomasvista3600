import { useMemo, useState } from "react";
import { PlugArt } from "@/components/plug-art";
import { circuitFamily, circuitLabel } from "@/data/circuits";
import { connectors, findCircuitHits, type Connector, type Pin } from "@/data/connectors";
import { cn } from "@/lib/utils";

const GROUPS: { id: string; label: string; match: (c: Connector) => boolean }[] = [
  {
    id: "firewall",
    label: "DASH CONNECTOR / FRONT END / ENGINE DASH",
    match: (c) => ["2", "2A", "2B", "2B-M", "3"].includes(c.tag),
  },
  {
    id: "hyd",
    label: "HYDRAULIC BRAKE SYSTEM W/004040",
    match: (c) => ["47/48", "49", "50", "51", "300", "301", "763"].includes(c.tag),
  },
  {
    id: "power",
    label: "FUSE BLOCK / KEY SWITCH / START RELAY",
    match: (c) => ["FUSE", "63", "387", "396", "615"].includes(c.tag),
  },
  {
    id: "engine",
    label: "CEC CONTROL MODULE / ENGINE",
    match: (c) => ["379", "384", "382", "303", "304", "345", "398", "406", "373", "374"].includes(c.tag),
  },
  {
    id: "fuel",
    label: "FUEL FILTER / FUEL SHUT-OFF SOLENOID",
    match: (c) => ["71", "399", "401", "470", "431"].includes(c.tag),
  },
  {
    id: "cab",
    label: "INSTRUMENT CLUSTER / CAB",
    match: (c) => ["20", "26", "27", "28", "60", "61", "391", "392", "194", "459", "377"].includes(c.tag),
  },
  {
    id: "front",
    label: "HEADLIGHT / HORN / TURN SIGNAL",
    match: (c) => ["502", "504", "503", "605", "540"].includes(c.tag),
  },
];

export function PinMap({ query }: { query: string }) {
  const [connId, setConnId] = useState("dash-2-hyd");
  const [pinKey, setPinKey] = useState<string | null>("H5");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return connectors;
    return connectors.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.tag.toLowerCase().includes(q) ||
        c.harness.toLowerCase().includes(q) ||
        c.pins.some(
          (p) =>
            p.cavity.toLowerCase().includes(q) ||
            p.circuit.toLowerCase().includes(q) ||
            p.dest.toLowerCase().includes(q),
        ),
    );
  }, [query]);

  const conn = connectors.find((c) => c.id === connId) ?? filtered[0] ?? connectors[0];
  const selectedPin: Pin | undefined = conn.pins.find((p) => p.cavity === pinKey) ?? conn.pins[0];
  const hits = selectedPin ? findCircuitHits(selectedPin.circuit) : [];

  return (
    <div className="grid min-w-0 gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="min-w-0 space-y-4">
        {GROUPS.map((g) => {
          const items = filtered.filter(g.match);
          if (items.length === 0) return null;
          return (
            <div key={g.id}>
              <p className="mb-1.5 font-mono text-[10px] tracking-widest text-subtle uppercase">{g.label}</p>
              <div className="flex flex-col gap-1">
                {items.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setConnId(c.id);
                      setPinKey(c.pins[0]?.cavity ?? null);
                    }}
                    className={cn(
                      "rounded-sm border px-2.5 py-2 text-left text-sm transition-colors",
                      c.id === conn.id
                        ? "border-accent bg-raised text-fg"
                        : "border-transparent bg-surface text-muted hover:border-line hover:text-fg",
                    )}
                  >
                    <span className="font-mono text-[10px] text-accent">{c.tag}</span>
                    <div className="leading-snug">{c.name}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </aside>

      <div className="min-w-0 space-y-4">
        <header>
          <p className="font-mono text-xs tracking-widest text-accent uppercase">
            Connector {conn.tag} · printed page {conn.page}
          </p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">{conn.name}</h2>
          <p className="mt-1 text-sm text-muted">{conn.harness}</p>
          {conn.optional ? <p className="mt-1 text-xs text-warn">{conn.optional}</p> : null}
        </header>

        <PlugArt
          tag={conn.tag}
          pins={conn.pins}
          active={selectedPin?.cavity}
          family={selectedPin ? circuitFamily(selectedPin.circuit) : ""}
          onPick={setPinKey}
        />

        <div className="max-w-full overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-surface text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-3 py-2 font-medium">Pin</th>
                <th className="px-3 py-2 font-medium">Circuit</th>
                <th className="px-3 py-2 font-medium">Function</th>
                <th className="px-3 py-2 font-medium">Goes to</th>
              </tr>
            </thead>
            <tbody>
              {conn.pins.map((p) => {
                const on = p.cavity === selectedPin?.cavity;
                return (
                  <tr
                    key={p.cavity}
                    className={cn("cursor-pointer border-t border-border", on && "bg-raised")}
                    onClick={() => setPinKey(p.cavity)}
                  >
                    <td className="px-3 py-2 font-mono text-fg">{p.cavity}</td>
                    <td className="px-3 py-2 font-mono text-steel">{p.circuit}</td>
                    <td className="px-3 py-2 text-muted">{circuitLabel(p.circuit)}</td>
                    <td className="px-3 py-2 text-muted">{p.dest}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedPin ? (
          <section className="rounded-lg border border-border bg-raised p-4">
            <p className="font-mono text-xs tracking-widest text-accent uppercase">
              Circuit {selectedPin.circuit} · family {circuitFamily(selectedPin.circuit) || "—"}
            </p>
            <h3 className="mt-1 font-display text-2xl font-semibold">
              {conn.tag}-{selectedPin.cavity} → {circuitLabel(selectedPin.circuit)}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{selectedPin.dest}</p>
            <p className="mt-4 mb-2 text-xs tracking-wide text-subtle uppercase">
              Other pins on this circuit
            </p>
            <ul className="space-y-1">
              {hits.map((h) => (
                <li key={`${h.connector.id}-${h.pin.cavity}`}>
                  <button
                    type="button"
                    onClick={() => {
                      setConnId(h.connector.id);
                      setPinKey(h.pin.cavity);
                    }}
                    className="w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-surface"
                  >
                    <span className="font-mono text-accent">
                      {h.connector.tag}-{h.pin.cavity}
                    </span>
                    <span className="text-muted"> · {h.connector.name} · </span>
                    <span className="font-mono text-steel">{h.pin.circuit}</span>
                    <span className="text-subtle"> — {h.pin.dest}</span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
