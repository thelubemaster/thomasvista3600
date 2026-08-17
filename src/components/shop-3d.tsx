import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { circuitToggles, partById, type ToggleId } from "@/data/world";
import { keyPositions, type KeyPos } from "@/data/follow";
import { FollowPanel } from "@/components/follow-panel";
import { relayFaces } from "@/data/relay-pins";
import { cn } from "@/lib/utils";

const ShopCanvas = lazy(() => import("./shop-canvas"));

const STORAGE = "ih-3600-shop-circuits";

function loadOn(): Set<string> {
  if (typeof window === "undefined") return defaultCrit();
  try {
    const raw = localStorage.getItem(STORAGE);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch {
    /* ignore */
  }
  return defaultCrit();
}

function defaultCrit() {
  return new Set(circuitToggles.filter((c) => c.crit).map((c) => c.id));
}

export function Shop3D() {
  const [ready, setReady] = useState(false);
  const [on, setOn] = useState<Set<string>>(defaultCrit);
  const [selected, setSelected] = useState<string | null>(null);
  const [keyPos, setKeyPos] = useState<KeyPos>("ign");
  const [follow, setFollow] = useState<string | null>("19");
  const [hopWireId, setHopWireId] = useState<string | null>(null);

  useEffect(() => {
    setOn(loadOn());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE, JSON.stringify([...on]));
  }, [on, ready]);

  const part = selected ? partById(selected) : null;
  const face = part?.relayTag ? relayFaces.find((r) => r.id === part.relayTag) : null;

  const followId =
    follow ??
    part?.circuits.find((c) => on.has(c)) ??
    null;

  const keyHint = keyPositions.find((k) => k.id === keyPos)?.hint ?? "";

  const critOn = circuitToggles.filter((c) => c.crit).every((c) => on.has(c.id));
  const allOn = circuitToggles.every((c) => on.has(c.id));

  const setMany = (ids: string[], value: boolean) => {
    setOn((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (value) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const toggle = (id: ToggleId) => {
    setOn((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const count = on.size;
  const onMemo = useMemo(() => on, [on]);

  return (
    <div className="flex min-w-0 flex-col gap-4 lg:flex-row">
      <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-md border border-border bg-bg lg:min-h-[640px]">
        {ready ? (
          <Suspense fallback={<p className="p-6 font-mono text-sm text-muted">Loading shop…</p>}>
            <ShopCanvas
              on={onMemo}
              selected={selected}
              onSelect={(id) => {
                setSelected(id);
                if (id) {
                  const p = partById(id);
                  const c = p?.circuits.find((x) => on.has(x));
                  if (c) setFollow(c);
                }
                setHopWireId(null);
              }}
              keyPos={keyPos}
              followCircuit={followId}
              hopWireId={hopWireId}
            />
          </Suspense>
        ) : (
          <p className="p-6 font-mono text-sm text-muted">Loading shop…</p>
        )}
        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center gap-2">
          <div className="flex rounded-sm border border-border bg-raised/95 p-1">
            {keyPositions.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKeyPos(k.id)}
                className={cn(
                  "min-h-9 px-3 text-xs font-medium",
                  keyPos === k.id ? "rounded-xs bg-accent text-accent-fg" : "text-muted hover:text-fg",
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
        <p className="pointer-events-none absolute bottom-3 left-3 font-mono text-[10px] text-subtle">
          Drag to orbit · tap a part · key shows what is live
        </p>
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-3 lg:w-80">
        <div className="rounded-md border border-border bg-surface p-3">
          <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">KEY SWITCH (63)</p>
          <p className="mt-1 text-sm text-muted">{keyHint}</p>
          <p className="mt-3 font-mono text-[10px] tracking-widest text-subtle uppercase">Circuits on</p>
          <p className="mt-1 font-display text-2xl">{count}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            <button type="button" className="rounded-xs border border-border px-2 py-1.5 text-xs hover:bg-raised" onClick={() => setOn(defaultCrit())}>
              Engine only
            </button>
            <button
              type="button"
              className="rounded-xs border border-border px-2 py-1.5 text-xs hover:bg-raised"
              onClick={() => setMany(["90"], true)}
            >
              + Hyd
            </button>
            <button type="button" className="rounded-xs border border-border px-2 py-1.5 text-xs hover:bg-raised" onClick={() => setOn(new Set(circuitToggles.map((c) => c.id)))}>
              All
            </button>
            <button type="button" className="rounded-xs border border-border px-2 py-1.5 text-xs hover:bg-raised" onClick={() => setOn(new Set())}>
              None
            </button>
          </div>
          <p className="mt-2 text-xs text-muted">
            {critOn ? "Engine-run circuits are on." : "Some engine-run circuits are off."} {allOn ? "Everything else is on too." : ""}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-wire-hot" /> Hot · battery</span>
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-wire-key" /> Hot · key</span>
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-wire-gnd ring-1 ring-fg/40" /> Ground</span>
            <span className="flex items-center gap-2"><i className="size-2.5 rounded-full bg-wire-sig" /> Signal</span>
          </div>
        </div>

        <FollowPanel
          circuit={followId}
          hopWireId={hopWireId}
          onCircuit={(id) => {
            setFollow(id);
            setHopWireId(null);
            setSelected(null);
            if (id && !on.has(id)) {
              setOn((prev) => new Set(prev).add(id));
            }
          }}
          onHop={(h) => {
            setHopWireId(h.wireId);
            setSelected(h.toId);
            setFollow(h.circuit.match(/^\d+/)?.[0] ?? h.circuit);
            const fam = h.circuit.match(/^\d+/)?.[0];
            if (fam && !on.has(fam)) {
              setOn((prev) => new Set(prev).add(fam));
            }
          }}
        />

        <div className="max-h-[280px] overflow-y-auto rounded-md border border-border bg-surface lg:max-h-[220px]">
          <p className="sticky top-0 border-b border-border bg-surface px-3 py-2 font-mono text-[10px] tracking-widest text-subtle uppercase">
            Add / take away
          </p>
          <ul>
            {circuitToggles.map((c) => {
              const active = on.has(c.id);
              const watching = followId === c.id;
              return (
                <li key={c.id} className="border-b border-border last:border-0">
                  <div className="flex items-stretch">
                    <button
                      type="button"
                      onClick={() => toggle(c.id)}
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-3 px-3 py-2.5 text-left text-sm",
                        active ? "text-fg" : "text-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-4 place-items-center rounded-xs border",
                          active ? "border-accent bg-accent text-accent-fg" : "border-line",
                        )}
                      >
                        {active ? "–" : "+"}
                      </span>
                      <span className="font-mono text-xs text-accent">{c.id}</span>
                      <span className="flex-1 truncate">{c.title}</span>
                      {c.crit ? <span className="font-mono text-[10px] text-ok">RUN</span> : null}
                    </button>
                    <button
                      type="button"
                      className={cn(
                        "shrink-0 px-2.5 font-mono text-[10px] tracking-widest uppercase",
                        watching ? "text-accent" : "text-subtle hover:text-fg",
                      )}
                      onClick={() => {
                        if (!on.has(c.id)) toggle(c.id);
                        setFollow(c.id);
                        setHopWireId(null);
                        setSelected(null);
                      }}
                    >
                      Go
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-md border border-border bg-surface p-3">
          {part ? (
            <>
              <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">{part.zone === "cab" ? "Cab" : part.zone === "wall" ? "Firewall" : "Engine"}</p>
              <h2 className="mt-1 font-display text-xl">{part.label}</h2>
              <p className="text-sm text-muted">{part.sub}</p>
              <p className="mt-2 text-sm">{part.detail}</p>
              {face ? (
                <ul className="mt-3 space-y-1.5 border-t border-border pt-3">
                  {face.pins.filter((p) => p.circuit !== "—").map((p) => (
                    <li key={p.iso} className="grid grid-cols-[2.2rem_4.2rem_1fr] gap-2 text-xs">
                      <span className="font-mono text-accent">{p.iso}</span>
                      <span className="font-mono text-muted">{p.circuit}</span>
                      <span className="text-fg">{p.goes}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-3 font-mono text-[10px] tracking-widest text-subtle uppercase">On this part</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {part.circuits.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      toggle(c as ToggleId);
                      setFollow(c);
                    }}
                    className={cn(
                      "rounded-xs border px-2 py-1 font-mono text-xs",
                      on.has(c) ? "border-accent text-accent" : "border-border text-muted",
                    )}
                  >
                    {on.has(c) ? "–" : "+"} {c}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">Shop</p>
              <h2 className="mt-1 font-display text-xl">T444E 7.3 POWER STROKE</h2>
              <p className="mt-2 text-sm text-muted">
                This bus is the 7.3 V8. CEC CONTROL MODULE (379) lives on the engine. Cold start is eight glow plugs, not ether.
              </p>
              <p className="mt-2 text-sm text-muted">Turn the key. Press Go next to a circuit, then tap each hop.</p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
