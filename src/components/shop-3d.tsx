"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { circuitToggles, partById } from "@/data/world";
import { hopsForCircuit, keyPositions, type Hop, type KeyPos } from "@/data/follow";
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

function hopChip(h: Hop) {
  const num = h.toLabel.match(/\(([^)]+)\)\s*$/);
  if (num) return num[1];
  const word = h.toLabel.split(/[·,/]/)[0]?.trim() ?? h.circuit;
  return word.length > 14 ? `${word.slice(0, 13)}…` : word;
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

  const onMemo = useMemo(() => on, [on]);
  const hops = followId ? hopsForCircuit(followId) : [];
  const hopChips = (() => {
    const seen = new Set<string>();
    const out: Hop[] = [];
    for (const h of hops) {
      if (seen.has(h.toId)) continue;
      seen.add(h.toId);
      out.push(h);
    }
    return out;
  })();

  const pickPart = (id: string | null) => {
    setSelected(id);
    if (id) {
      const p = partById(id);
      const c = p?.circuits.find((x) => on.has(x));
      if (c) setFollow(c);
    }
    setHopWireId(null);
  };

  const walkHop = (h: Hop) => {
    setHopWireId(h.wireId);
    setSelected(h.toId);
    setFollow(h.circuit.match(/^\d+/)?.[0] ?? h.circuit);
    const fam = h.circuit.match(/^\d+/)?.[0];
    if (fam && !on.has(fam)) {
      setOn((prev) => new Set(prev).add(fam));
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:flex-row">
      <div className="relative isolate h-[min(72svh,640px)] w-full overflow-hidden rounded-md border border-border bg-bg lg:h-[min(78vh,680px)]">
        <div className="absolute inset-0">
          {ready ? (
            <Suspense fallback={<p className="p-6 font-mono text-sm text-muted">Loading shop…</p>}>
              <ShopCanvas
                on={onMemo}
                selected={selected}
                onSelect={pickPart}
                keyPos={keyPos}
                followCircuit={followId}
                hopWireId={hopWireId}
              />
            </Suspense>
          ) : (
            <p className="p-6 font-mono text-sm text-muted">Loading shop…</p>
          )}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-2 sm:justify-start sm:p-3">
          <div className="pointer-events-auto flex rounded-sm border border-border bg-raised/95 p-1">
            {keyPositions.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setKeyPos(k.id)}
                className={cn(
                  "min-h-10 px-3 text-xs font-medium",
                  keyPos === k.id ? "rounded-xs bg-accent text-accent-fg" : "text-muted hover:text-fg",
                )}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 z-10 space-y-1.5 p-2 sm:p-3">
          <label className="block">
            <span className="sr-only">Circuit</span>
            <select
              className="h-11 w-full rounded-xs border border-border bg-raised/95 px-2 font-mono text-xs text-fg"
              value={followId ?? ""}
              onChange={(e) => {
                const id = e.target.value;
                setFollow(id || null);
                setHopWireId(null);
                setSelected(null);
                if (id && !on.has(id)) setOn((prev) => new Set(prev).add(id));
              }}
            >
              <option value="">Circuit…</option>
              {circuitToggles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} · {c.title}
                </option>
              ))}
            </select>
          </label>
          {hopChips.length ? (
            <div className="hop-strip flex gap-1 overflow-x-auto">
              {hopChips.map((h) => {
                const active = hopWireId === h.wireId;
                return (
                  <button
                    key={h.wireId}
                    type="button"
                    onClick={() => walkHop(h)}
                    className={cn(
                      "flex min-h-10 shrink-0 items-center gap-1.5 rounded-xs border px-2.5 font-mono text-[11px]",
                      active
                        ? "border-accent bg-accent text-accent-fg"
                        : "border-border bg-raised/95 text-fg",
                    )}
                  >
                    <span className={active ? "opacity-80" : "text-accent"}>{h.i}</span>
                    <span>{hopChip(h)}</span>
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </div>

      {part ? (
        <div className="rounded-md border border-border bg-surface p-3 lg:hidden">
          <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">
            {part.zone === "cab" ? "Cab" : part.zone === "wall" ? "Firewall" : "Engine"}
          </p>
          <h2 className="mt-1 font-display text-lg">{part.label}</h2>
          <p className="text-sm text-muted">{part.detail}</p>
        </div>
      ) : null}

      <aside className="hidden w-80 shrink-0 flex-col gap-3 lg:flex">
        <div className="flex flex-wrap gap-1">
          <button type="button" className="min-h-10 rounded-xs border border-border px-3 text-sm hover:bg-raised" onClick={() => setOn(defaultCrit())}>
            Engine
          </button>
          <button type="button" className="min-h-10 rounded-xs border border-border px-3 text-sm hover:bg-raised" onClick={() => setMany(["90"], true)}>
            + Hyd
          </button>
          <button type="button" className="min-h-10 rounded-xs border border-border px-3 text-sm hover:bg-raised" onClick={() => setOn(new Set(circuitToggles.map((c) => c.id)))}>
            All
          </button>
          <button type="button" className="min-h-10 rounded-xs border border-border px-3 text-sm hover:bg-raised" onClick={() => setOn(new Set())}>
            None
          </button>
        </div>
        <p className="text-sm text-muted">{keyHint}</p>
        <FollowPanel
          circuit={followId}
          hopWireId={hopWireId}
          onCircuit={(id) => {
            setFollow(id);
            setHopWireId(null);
            setSelected(null);
            if (id && !on.has(id)) setOn((prev) => new Set(prev).add(id));
          }}
          onHop={walkHop}
        />
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
            </>
          ) : (
            <>
              <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">Shop</p>
              <h2 className="mt-1 font-display text-xl">T444E 7.3 POWER STROKE</h2>
              <p className="mt-2 text-sm text-muted">Turn the key. Pick a circuit. Tap each hop.</p>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
