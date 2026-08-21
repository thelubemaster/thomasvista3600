import type { RelayFace } from "@/data/relay-pins";
import { cn } from "@/lib/utils";

export function RelaySocket({
  face,
  pinId,
  onPick,
}: {
  face: RelayFace;
  pinId: string;
  onPick: (id: string) => void;
}) {
  const by = Object.fromEntries(face.pins.map((p) => [p.id, p]));
  if (face.layout === "flash2") {
    return (
      <div className="rounded-sm border border-[#c9c2b4] bg-[#f4f0e6] p-2 text-[#1a1814]">
        <p className="mb-1 font-mono text-[10px] tracking-widest uppercase opacity-70">FLASHER (R1) · two blades</p>
        <div className="flex justify-center gap-6">
          {(["A", "B"] as const).map((id) => {
            const p = by[id];
            const on = pinId === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onPick(id)}
                className={cn(
                  "grid size-12 place-items-center border-2 border-[#1a1814] font-mono text-xs",
                  on ? "bg-accent text-accent-fg" : "bg-[#f4f0e6]",
                )}
              >
                {p?.circuit ?? id}
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs">Round can in the fuse-panel lid. Two blades only.</p>
      </div>
    );
  }
  if (face.layout === "iso5") {
    const five = [
      { id: "4", iso: "87", className: "col-start-1" },
      { id: "5", iso: "30", className: "col-start-3" },
      { id: "3", iso: "85", className: "col-start-1 row-start-2" },
      { id: "2", iso: "87a", className: "col-start-2 row-start-2" },
      { id: "1", iso: "86", className: "col-start-3 row-start-2" },
    ];
    return (
      <div className="rounded-sm border border-[#c9c2b4] bg-[#f4f0e6] p-2 text-[#1a1814]">
        <p className="mb-1 font-mono text-[10px] tracking-widest uppercase opacity-70">Mating end · 5-cavity</p>
        <div className="mx-auto grid w-40 grid-cols-3 grid-rows-2 gap-1 rounded-xs border-2 border-[#1a1814] p-1.5">
          {five.map((c) => {
            const p = by[c.id] ?? face.pins.find((x) => x.iso === c.iso);
            const on = pinId === c.id || pinId === p?.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onPick(p?.id ?? c.id)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-center border border-[#1a1814] font-mono text-[10px]",
                  c.className,
                  on ? "bg-accent text-accent-fg" : "bg-[#f4f0e6]",
                )}
              >
                <span className="opacity-70">{c.id}</span>
                <span className="font-semibold">{p?.circuit ?? "—"}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs">Five blades. Empty cavity is unused on this chassis.</p>
      </div>
    );
  }
  const cells = [
    { id: "4", iso: "30", className: "col-start-2" },
    { id: "5", iso: "87a", className: "col-start-1 row-start-2" },
    { id: "3", iso: "87", className: "col-start-2 row-start-2" },
    { id: "2", iso: "85", className: "col-start-3 row-start-2" },
    { id: "1", iso: "86", className: "col-start-2 row-start-3" },
  ];
  return (
    <div className="rounded-sm border border-[#c9c2b4] bg-[#f4f0e6] p-2 text-[#1a1814]">
      <p className="mb-1 font-mono text-[10px] tracking-widest uppercase opacity-70">Mating end · 5-cavity micro</p>
      <div className="mx-auto grid w-40 grid-cols-3 grid-rows-3 gap-1 rounded-xs border-2 border-[#1a1814] p-1.5">
        {cells.map((c) => {
          const p = by[c.id] ?? face.pins.find((x) => x.iso === c.iso);
          const on = pinId === c.id || pinId === p?.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onPick(p?.id ?? c.id)}
              className={cn(
                "flex aspect-square flex-col items-center justify-center border border-[#1a1814] font-mono text-[10px]",
                c.className,
                on ? "bg-accent text-accent-fg" : "bg-[#f4f0e6]",
              )}
            >
              <span className="opacity-70">{c.id}</span>
              <span className="font-semibold">{p?.circuit ?? "—"}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-1.5 text-xs">Same face as the book: 4 on top, 5-3-2 across, 1 on the bottom.</p>
    </div>
  );
}
