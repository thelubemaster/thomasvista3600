import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { circuitToggles } from "@/data/world";
import { fuses } from "@/data/wiring";
import { connectors } from "@/data/connectors";
import { relayFaces } from "@/data/relay-pins";
import { jobItems } from "@/data/job";

export type JumpTab = "shop" | "book" | "wall" | "relays" | "circuits" | "pins" | "panel" | "all" | "job";

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
    <div className="fixed inset-0 z-50 grid place-items-start bg-bg/70 px-3 pt-[12vh]" onClick={() => onOpen(false)}>
      <Command
        label="Jump"
        className="mx-auto w-full max-w-xl overflow-hidden rounded-md border border-border bg-surface shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <Command.Input
          autoFocus
          value={q}
          onValueChange={setQ}
          placeholder="Jump to circuit, fuse, relay, plug…"
          className="h-12 w-full border-b border-border bg-transparent px-4 font-mono text-sm text-fg outline-none placeholder:text-subtle"
        />
        <Command.List className="max-h-80 overflow-y-auto p-1">
          <Command.Empty className="px-3 py-6 text-sm text-muted">Nothing matches.</Command.Empty>
          <Command.Group heading="Places" className="px-2 py-1 font-mono text-[10px] tracking-widest text-subtle uppercase">
            {(
              [
                ["shop", "3D shop"],
                ["job", "Rewire job"],
                ["wall", "Firewall plugs"],
                ["circuits", "All circuits"],
                ["relays", "Relays"],
                ["panel", "Fuse panel"],
                ["pins", "Pin map"],
                ["book", "Book"],
              ] as const
            ).map(([id, label]) => (
              <Item key={id} value={label} onSelect={() => { onJump(id); onOpen(false); }}>
                {label}
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
      className="flex cursor-pointer items-center gap-2 rounded-xs px-2 py-2 text-sm text-muted data-[selected=true]:bg-raised data-[selected=true]:text-fg"
    >
      {children}
    </Command.Item>
  );
}
