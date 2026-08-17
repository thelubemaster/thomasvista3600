import { useEffect, useMemo, useState } from "react";
import { PlugArt } from "@/components/plug-art";
import { BOOK_PLUG_GROUPS } from "@/data/book-plugs";
import { circuitFamily, circuitLabel } from "@/data/circuits";
import { connectors, type Pin } from "@/data/connectors";
import { cn } from "@/lib/utils";

export function BookPlugs({ focus }: { focus?: string | null }) {
  const [groupId, setGroupId] = useState<(typeof BOOK_PLUG_GROUPS)[number]["id"]>("wall");
  const [connId, setConnId] = useState("dash-2-hyd");
  const [cavity, setCavity] = useState<string | null>(null);

  useEffect(() => {
    if (!focus) return;
    const hit = connectors.find((c) => c.id === focus || c.tag === focus);
    if (!hit) return;
    const g = BOOK_PLUG_GROUPS.find((x) => (x.ids as readonly string[]).includes(hit.id));
    if (g) setGroupId(g.id);
    setConnId(hit.id);
    setCavity(hit.pins.find((p) => p.circuit !== "---" && p.circuit !== "—")?.cavity ?? hit.pins[0]?.cavity ?? null);
  }, [focus]);

  const group = BOOK_PLUG_GROUPS.find((g) => g.id === groupId) ?? BOOK_PLUG_GROUPS[0];
  const plugs = group.ids.map((id) => connectors.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c);
  const conn = connectors.find((c) => c.id === connId) ?? plugs[0];
  const pin: Pin | undefined = conn.pins.find((p) => p.cavity === cavity) ?? conn.pins[0];
  const fam = pin ? circuitFamily(pin.circuit) : "";

  const others = useMemo(() => {
    if (!pin || pin.circuit === "---" || pin.circuit === "—") return [];
    const famNum = circuitFamily(pin.circuit);
    return connectors.flatMap((c) =>
      c.pins
        .filter((p) => p.circuit === pin.circuit || (famNum && circuitFamily(p.circuit) === famNum))
        .map((p) => ({ c, p })),
    );
  }, [pin]);

  return (
    <div className="space-y-4">
      <nav className="tab-strip flex gap-1 overflow-x-auto">
        {BOOK_PLUG_GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => {
              setGroupId(g.id);
              const first = connectors.find((c) => c.id === g.ids[0]);
              if (first) {
                setConnId(first.id);
                setCavity(first.pins[0]?.cavity ?? null);
              }
            }}
            className={cn(
              "h-11 shrink-0 rounded-xs border px-3 text-sm",
              group.id === g.id ? "border-accent bg-raised text-fg" : "border-border text-muted",
            )}
          >
            {g.label}
          </button>
        ))}
      </nav>
      <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">
        Printed pages {group.page} · mating ends as in CTS-5123V
      </p>

      <div className="space-y-5">
        {plugs.map((c) => (
          <article
            id={`book-plug-${c.id}`}
            key={c.id}
            className={cn(
              "scroll-mt-28 rounded-lg border bg-surface p-3 sm:p-4",
              c.id === conn.id ? "border-accent" : "border-border",
            )}
          >
            <button
              type="button"
              className="mb-3 w-full text-left"
              onClick={() => {
                setConnId(c.id);
                setCavity(c.pins.find((p) => p.circuit !== "---")?.cavity ?? c.pins[0]?.cavity ?? null);
              }}
            >
              <p className="font-mono text-[10px] tracking-widest text-accent uppercase">
                ({c.tag}) · page {c.page}
              </p>
              <h3 className="font-display text-lg font-semibold sm:text-xl">{c.name}</h3>
              <p className="text-xs text-subtle">{c.harness}</p>
            </button>
            <PlugArt
              tag={c.tag}
              pins={c.pins}
              active={c.id === conn.id ? pin?.cavity : null}
              family={c.id === conn.id ? fam : ""}
              onPick={(cav) => {
                setConnId(c.id);
                setCavity(cav);
              }}
            />
          </article>
        ))}
      </div>

      {pin ? (
        <section className="rounded-lg border border-border bg-raised p-4">
          <p className="font-mono text-[10px] tracking-widest text-accent uppercase">
            {conn.tag}-{pin.cavity} · circuit {pin.circuit}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold">{circuitLabel(pin.circuit)}</h3>
          <p className="mt-1 text-sm text-muted">{pin.dest}</p>
          <div className="mt-4 max-w-full overflow-x-auto rounded-sm border border-border">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-surface text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="px-3 py-2 font-medium">Pin</th>
                  <th className="px-3 py-2 font-medium">Circuit</th>
                  <th className="px-3 py-2 font-medium">Goes to</th>
                </tr>
              </thead>
              <tbody>
                {conn.pins.map((p) => (
                  <tr
                    key={p.cavity}
                    className={cn("cursor-pointer border-t border-border", p.cavity === pin.cavity && "bg-surface")}
                    onClick={() => setCavity(p.cavity)}
                  >
                    <td className="px-3 py-2 font-mono">{p.cavity}</td>
                    <td className="px-3 py-2 font-mono text-steel">{p.circuit}</td>
                    <td className="px-3 py-2 text-muted">{p.dest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {others.length > 1 ? (
            <div className="mt-4">
              <p className="mb-1 font-mono text-[10px] tracking-widest text-subtle uppercase">Same circuit on other plugs</p>
              <ul className="space-y-1">
                {others.slice(0, 16).map(({ c, p }) => (
                  <li key={`${c.id}-${p.cavity}`}>
                    <button
                      type="button"
                      className="w-full rounded-xs px-2 py-1.5 text-left text-sm hover:bg-surface"
                      onClick={() => {
                        const g = BOOK_PLUG_GROUPS.find((x) => (x.ids as readonly string[]).includes(c.id));
                        if (g) setGroupId(g.id);
                        setConnId(c.id);
                        setCavity(p.cavity);
                        document.getElementById(`book-plug-${c.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      <span className="font-mono text-accent">
                        {c.tag}-{p.cavity}
                      </span>
                      <span className="text-muted"> · {c.name}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
