import { manual, manualSections } from "@/data/manual";
import { cn } from "@/lib/utils";

const LIVE_PDF = "https://thelubemaster.github.io/thomasvista3600/cts-5123v.pdf";

export function Manual({ query = "" }: { query?: string }) {
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

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-1 py-1 sm:px-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">CTS-5123V · AE-2811</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight">Printed pages</h2>
        </div>
        <a
          href={LIVE_PDF}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center rounded-sm border border-border bg-surface px-4 text-sm text-fg"
        >
          Open full PDF
        </a>
      </div>
      <p className="text-sm text-muted">
        {rows.length} sheets. Page 20 is cranking / thermal overcrank. Page 89 is START RELAY (387).
      </p>
      {manualSections.map((section) => {
        const items = rows.filter((m) => m.section === section);
        if (!items.length) return null;
        return (
          <section key={section} className="space-y-2">
            <h3 className="font-mono text-[10px] tracking-widest text-subtle uppercase">{section}</h3>
            <ul className="divide-y divide-border overflow-hidden rounded-md border border-border bg-surface">
              {items.map((m) => (
                <li key={m.id} className="px-3 py-3 sm:px-4">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-accent">{m.page}</span>
                    <span className={cn("font-medium", m.engineCritical ? "text-fg" : "text-muted")}>{m.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{m.notes}</p>
                  {m.circuits.length ? (
                    <p className="mt-1 font-mono text-[11px] text-subtle">
                      {m.circuits.map((c) => `Ckt ${c}`).join(" · ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {!rows.length ? <p className="text-sm text-muted">No pages match.</p> : null}
    </div>
  );
}
