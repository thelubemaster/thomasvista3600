import { lazy, Suspense, useState } from "react";
import { manual, manualSections } from "@/data/manual";
import { cn } from "@/lib/utils";

const BookPage = lazy(() => import("@/components/book-page").then((m) => ({ default: m.BookPage })));

export function Manual({
  query = "",
  onOpenDrawing,
}: {
  query?: string;
  onOpenDrawing?: (mapId: string) => void;
}) {
  const [printed, setPrinted] = useState<string | null>(null);
  const q = query.trim().toLowerCase();
  const rows = q
    ? manual.filter(
        (m) =>
          m.page.toLowerCase().includes(q) ||
          m.title.toLowerCase().includes(q) ||
          m.section.toLowerCase().includes(q) ||
          m.notes.toLowerCase().includes(q) ||
          m.circuits.some((c) => c.includes(q)),
      )
    : manual;

  if (printed) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-0 flex-1 items-center justify-center text-sm text-muted">Opening the book…</div>
        }
      >
        <BookPage printed={printed} onBack={() => setPrinted(null)} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-6 sm:py-8">
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">CTS-5123V · AE-2811</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">Printed pages</h2>
          <p className="mt-1 text-sm text-muted">
            {rows.length} sheets. Tap a row to open that page. Scroll this list — pinch/scroll the sheet after it opens.
          </p>
        </div>
        {manualSections.map((section) => {
          const items = rows.filter((m) => m.section === section);
          if (!items.length) return null;
          return (
            <section key={section} className="space-y-2">
              <h3 className="font-mono text-[10px] tracking-widest text-subtle uppercase">{section}</h3>
              <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
                {items.map((m) => (
                  <li key={m.id}>
                    <button
                      type="button"
                      onClick={() => setPrinted(m.page)}
                      className="flex w-full flex-col items-start px-3 py-3 text-left sm:px-4"
                    >
                      <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                        <span className="font-mono text-accent">p.{m.page}</span>
                        <span className={cn("font-medium", m.engineCritical ? "text-fg" : "text-muted")}>{m.title}</span>
                      </span>
                      <span className="mt-1 text-sm text-muted">{m.notes}</span>
                      {m.circuits.length ? (
                        <span className="mt-1 font-mono text-[11px] text-subtle">
                          {m.circuits.map((c) => `Ckt ${c}`).join(" · ")}
                        </span>
                      ) : null}
                    </button>
                    {m.mapId && onOpenDrawing ? (
                      <div className="px-3 pb-3 sm:px-4">
                        <button
                          type="button"
                          onClick={() => onOpenDrawing(m.mapId!)}
                          className="h-10 rounded-xs border border-border px-3 font-mono text-xs text-fg"
                        >
                          Open drawing {m.mapId}
                        </button>
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        {!rows.length ? <p className="text-sm text-muted">No pages match.</p> : null}
      </div>
    </div>
  );
}
