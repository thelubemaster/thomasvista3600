import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { circuitToggles } from "@/data/world";
import { fuses } from "@/data/wiring";
import { connectors } from "@/data/connectors";
import { relayFaces } from "@/data/relay-pins";
import { jobItems } from "@/data/job";
import { dxFlows } from "@/data/diagnose";

export type JumpTab = "shop" | "book" | "wall" | "relays" | "circuits" | "pins" | "panel" | "all" | "job" | "dx";

const SYMPTOMS: { value: string; label: string; tab: JumpTab; hint?: string }[] = [
  { value: "no crank no start silence 387 pin 85", label: "No crank", tab: "dx", hint: "no-crank" },
  { value: "click no crank solenoid", label: "Click, no crank", tab: "dx", hint: "click-no-crank" },
  { value: "no rpm tach 0 cps camshaft", label: "Cranks, tach 0", tab: "dx", hint: "no-rpm" },
  { value: "cranks no fire fuel glow", label: "Cranks, has RPM, no start", tab: "dx", hint: "no-fire" },
  { value: "pin 85 ground thermal overcrank", label: "Pin 85 / overcrank ground", tab: "dx", hint: "no-crank" },
  { value: "iso 86 85 voltage jumping coil", label: "ISO 85 / 86 primer", tab: "dx" },
  { value: "magnetic switch green ring j30", label: "Magnetic switch J30", tab: "dx", hint: "click-no-crank" },
  { value: "cps camshaft position sensor harmonic", label: "CPS / no RPM", tab: "shop", hint: "cps" },
];

export function CommandJump({
  open,
  onOpen,
  onJump,
}: {
  open: boolean;
  onOpen: (v: boolean) => void;
  onJump: (tab: JumpTab, hint?: string) => void;
}) {
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpen(!open);
      }
      if (e.key === "Escape") onOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpen]);

  const circuits = useMemo(() => circuitToggles, []);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-bg/80 sm:place-items-start sm:px-3 sm:pt-[12vh]"
      onClick={() => onOpen(false)}
    >
      <Command
        label="Jump"
        className="flex h-[min(88dvh,40rem)] w-full flex-col overflow-hidden rounded-t-lg border border-border bg-surface shadow-lg sm:mx-auto sm:h-auto sm:max-w-xl sm:rounded-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mt-2 mb-1 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden />
        <Command.Input
          autoFocus
          value={q}
          onValueChange={setQ}
          placeholder="No crank, circuit, fuse, relay…"
          className="h-14 w-full border-b border-border bg-transparent px-4 font-mono text-base text-fg outline-none placeholder:text-subtle sm:h-12 sm:text-sm"
        />
        <Command.List className="min-h-0 flex-1 overflow-y-auto p-1 sm:max-h-80 sm:flex-none">
          <Command.Empty className="px-3 py-6 text-sm text-muted">Nothing matches.</Command.Empty>
          <Command.Group heading="Symptoms" className="px-2 py-1 font-mono text-[10px] tracking-widest text-subtle uppercase">
            {SYMPTOMS.map((s) => (
              <Item
                key={s.label}
                value={s.value}
                onSelect={() => {
                  onJump(s.tab, s.hint);
                  onOpen(false);
                }}
              >
                {s.label}
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading="Places" className="px-2 py-1 font-mono text-[10px] tracking-widest text-subtle uppercase">
            {(
              [
                ["dx", "Diagnose"],
                ["shop", "Shop"],
                ["circuits", "Circuits"],
                ["panel", "Fuses"],
                ["book", "Book"],
                ["job", "Job"],
              ] as const
            ).map(([id, label]) => (
              <Item key={id} value={label} onSelect={() => { onJump(id); onOpen(false); }}>
                {label}
              </Item>
            ))}
            {dxFlows.map((f) => (
              <Item
                key={f.id}
                value={`${f.title} ${f.blurb}`}
                onSelect={() => {
                  onJump("dx", f.id);
                  onOpen(false);
                }}
              >
                Dx · {f.title}
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading="Circuits" className="px-2 py-1 font-mono text-[10px] tracking-widest text-subtle uppercase">
            {circuits.map((c) => (
              <Item
                key={c.id}
                value={`${c.id} ${c.title}`}
                onSelect={() => {
                  onJump("circuits", c.id);
                  onOpen(false);
                }}
              >
                <span className="font-mono text-accent">{c.id}</span> {c.title}
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading="Fuses" className="px-2 py-1 font-mono text-[10px] tracking-widest text-subtle uppercase">
            {fuses.map((f) => (
              <Item
                key={f.id}
                value={`${f.id} ${f.cover} ${f.description}`}
                onSelect={() => {
                  onJump("panel", f.id);
                  onOpen(false);
                }}
              >
                <span className="font-mono text-accent">{f.id}</span> {f.cover} · {f.size}
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading="Relays" className="px-2 py-1 font-mono text-[10px] tracking-widest text-subtle uppercase">
            {relayFaces.map((r) => (
              <Item
                key={r.id}
                value={`${r.tag} ${r.name}`}
                onSelect={() => {
                  onJump("relays", r.id);
                  onOpen(false);
                }}
              >
                <span className="font-mono text-accent">{r.tag}</span> {r.name}
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading="Connectors" className="px-2 py-1 font-mono text-[10px] tracking-widest text-subtle uppercase">
            {connectors.map((c) => (
              <Item
                key={c.id}
                value={`${c.tag} ${c.name}`}
                onSelect={() => {
                  onJump(c.tag === "2" || c.tag === "2A" || c.tag === "2B" || c.tag === "3" ? "wall" : "pins", c.id);
                  onOpen(false);
                }}
              >
                <span className="font-mono text-accent">{c.tag}</span> {c.name}
              </Item>
            ))}
          </Command.Group>
          <Command.Group heading="Job items" className="px-2 py-1 font-mono text-[10px] tracking-widest text-subtle uppercase">
            {jobItems.slice(0, 8).map((it) => (
              <Item
                key={it.id}
                value={`job ${it.label}`}
                onSelect={() => {
                  onJump("job");
                  onOpen(false);
                }}
              >
                {it.label}
              </Item>
            ))}
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}

function Item({
  value,
  onSelect,
  children,
}: {
  value: string;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xs px-3 py-2.5 text-sm text-muted data-[selected=true]:bg-raised data-[selected=true]:text-fg"
    >
      {children}
    </Command.Item>
  );
}
