import { useEffect, useMemo, useState } from "react";
import { FlowSchematic } from "@/components/flow-schematic";
import { PlugArt } from "@/components/plug-art";
import { extraFor } from "@/data/circuit-extra";
import { relaysForCircuit } from "@/data/relay-pins";
import { circuitFamily, circuitLabel } from "@/data/circuits";
import { connectors, findCircuitHits, type Pin } from "@/data/connectors";
import { flowMaps } from "@/data/schematics";
import { cn } from "@/lib/utils";

const PLUGS = [
  {
    id: "dash",
    connId: "dash-2-hyd",
    extraId: "front-2-cab",
    tag: "2",
    title: "DASH CONNECTOR (2)",
    where: "ENGINE CONNECTOR W/HYD BRAKES (CAB SIDE)",
    page: "78",
  },
  {
    id: "eng2a",
    connId: "engine-2a-hyd",
    tag: "2A",
    title: "ENGINE CONNECTOR (2A)",
    where: "W/004040 (HYD BRAKES) · engine harness mate",
    page: "79",
  },
  {
    id: "front",
    connId: "front-2-cab",
    tag: "2B",
    title: "FRONT END CONNECTOR (2B)",
    where: "Lamp / horn half · tall 3×8",
    page: "79",
  },
  {
    id: "eng3",
    connId: "eng-dash-3",
    tag: "3",
    title: "ELECTRONIC ENGINE DASH CONNECTOR (3)",
    where: "CAB HARNESS ↔ ENGINE HARNESS · green seal",
    page: "80",
  },
] as const;

function pinAt(pins: Pin[], cavity: string) {
  return pins.find((p) => p.cavity === cavity);
}

function isEmpty(p?: Pin) {
  return !p || p.circuit === "---" || p.circuit === "—";
}

function plugPins(def: (typeof PLUGS)[number]): Pin[] {
  const main = connectors.find((c) => c.id === def.connId)?.pins ?? [];
  if ("extraId" in def && def.extraId) {
    const extra = connectors.find((c) => c.id === def.extraId)?.pins ?? [];
    return [...main, ...extra];
  }
  return main;
}

export function Firewall({ focus }: { focus?: string | null }) {
  const [plugId, setPlugId] = useState("dash");
  const [cavity, setCavity] = useState("H5");

  useEffect(() => {
    if (!focus) return;
    const next = PLUGS.find((p) => p.id === focus || p.connId === focus || p.tag === focus);
    if (next) setPlugId(next.id);
  }, [focus]);

  const plug = PLUGS.find((p) => p.id === plugId) ?? PLUGS[0];
  const pins = plugPins(plug);
  const pin = pinAt(pins, cavity) ?? pins.find((p) => !isEmpty(p)) ?? pins[0];
  const owner =
    connectors.find((c) => c.id === plug.connId && c.pins.some((p) => p.cavity === pin.cavity)) ??
    connectors.find((c) => "extraId" in plug && c.id === plug.extraId && c.pins.some((p) => p.cavity === pin.cavity)) ??
    connectors.find((c) => c.id === plug.connId)!;
  const fam = circuitFamily(pin.circuit);
  const extra = extraFor(pin.circuit);
  const map = flowMaps.find((m) => m.id === fam);
  const hits = useMemo(() => findCircuitHits(pin.circuit), [pin.circuit]);
  const relayHits = relaysForCircuit(pin.circuit);

  function pick(nextPlug: string, nextCavity: string) {
    setPlugId(nextPlug);
    setCavity(nextCavity);
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="font-mono text-xs tracking-widest text-accent uppercase">
          CONNECTOR BODY COMPOSITE — VIEWED FROM MATING ENDS
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight">Find the plug</h2>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
          Same drawings as the book. Cream plate, black outline, mating end. Tap a hole — that circuit lights on every plug.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="space-y-5">
          {PLUGS.map((p) => (
            <article key={p.id} className="rounded-lg border border-border bg-surface p-3 sm:p-4">
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-mono text-[10px] tracking-widest text-accent uppercase">
                    Printed page {p.page}
                  </p>
                  <h3 className="font-display text-xl font-semibold">{p.title}</h3>
                </div>
                <p className="text-xs text-subtle">{p.where}</p>
              </div>
              <PlugArt
                tag={p.tag}
                pins={plugPins(p)}
                active={p.id === plug.id ? cavity : null}
                family={fam}
                onPick={(cav) => pick(p.id, cav)}
              />
            </article>
          ))}
        </div>

        <aside className="rounded-lg border border-border bg-raised p-4 sm:p-5">
          <p className="font-mono text-xs tracking-widest text-accent uppercase">
            {owner.tag}-{pin.cavity} · circuit {pin.circuit}
          </p>
          <h3 className="mt-1 font-display text-2xl font-semibold">{circuitLabel(pin.circuit)}</h3>
          <p className="mt-1 text-sm text-muted">{pin.dest}</p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Fact label="Engine to run" value={extra?.engineCritical ? "Yes — keep" : "No"} hot={extra?.engineCritical} />
            <Fact label="Power" value={extra?.power ?? "See path"} />
            <Fact label="Fuse" value={extra?.fuse ?? "—"} />
            <Fact label="Relay" value={extra?.relay ?? "None"} />
          </dl>

          {extra ? (
            <div className="mt-4 space-y-3 text-sm leading-relaxed">
              <Block title="If you cut it" body={extra.ifCut} />
              <Block title="Cab side" body={extra.cab} />
              <Block title="Engine / other side of the firewall" body={extra.engine} />
              {extra.color ? <Block title="Color" body={extra.color} /> : null}
              <Block title="More" body={extra.more} />
            </div>
          ) : null}

          {relayHits.length ? (
            <div className="mt-4">
              <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">Relay pins on this circuit</p>
              <ul className="mt-2 space-y-2">
                {relayHits.map(({ face, pin: rp }) => (
                  <li key={`${face.id}-${rp.id}`} className="rounded-sm border border-line bg-bg px-3 py-2 text-sm">
                    <span className="font-mono text-accent">
                      {face.tag} pin {rp.id} ({rp.iso})
                    </span>
                    <span className="text-muted"> · {face.name}</span>
                    <p className="mt-0.5 text-xs text-subtle">
                      {rp.role} · {rp.circuit} · {rp.goes}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>

      <section>
        <p className="mb-2 font-mono text-[10px] tracking-widest text-subtle uppercase">
          Whole circuit {pin.circuit} · {hits.length} pins
        </p>
        <ul className="grid gap-1 sm:grid-cols-2">
          {hits.map((h) => (
            <li key={`${h.connector.id}-${h.pin.cavity}`}>
              <button
                type="button"
                onClick={() => {
                  const next = PLUGS.find((p) => p.connId === h.connector.id || ("extraId" in p && p.extraId === h.connector.id));
                  if (next) pick(next.id, h.pin.cavity);
                }}
                className="w-full rounded-sm border border-transparent px-2 py-1.5 text-left text-sm hover:border-line hover:bg-surface"
              >
                <span className="font-mono text-accent">
                  {h.connector.tag}-{h.pin.cavity}
                </span>
                <span className="text-muted"> · {h.connector.name}</span>
                <span className="block font-mono text-xs text-steel">
                  {h.pin.circuit} — {h.pin.dest}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      {map ? <FlowSchematic key={`${map.id}-${pin.cavity}`} map={map} /> : null}
    </div>
  );
}

function Fact({ label, value, hot }: { label: string; value: string; hot?: boolean }) {
  return (
    <div>
      <dt className="font-mono text-[10px] tracking-widest text-subtle uppercase">{label}</dt>
      <dd className={cn("mt-0.5 leading-snug", hot ? "text-accent" : "text-fg")}>{value}</dd>
    </div>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">{title}</p>
      <p className="mt-0.5 text-muted">{body}</p>
    </div>
  );
}
