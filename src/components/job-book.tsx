import { useEffect, useMemo, useState } from "react";
import { Download, Printer, Upload } from "lucide-react";
import {
  exportJob,
  importJob,
  jobItems,
  loadJob,
  MARKS,
  saveJob,
  type JobMark,
  type JobSave,
} from "@/data/job";
import { cn } from "@/lib/utils";

export function JobBook({ query = "" }: { query?: string }) {
  const [job, setJob] = useState<JobSave>(() => ({ version: 1, marks: {}, notes: {}, updated: 0 }));
  const [ready, setReady] = useState(false);
  const [filter, setFilter] = useState<"all" | "run" | JobMark>("all");
  const [kind, setKind] = useState<"all" | "circuit" | "fuse" | "relay">("all");

  useEffect(() => {
    setJob(loadJob());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    saveJob(job);
  }, [job, ready]);

  useEffect(() => {
    const flush = () => saveJob(job);
    const onHide = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", flush);
    };
  }, [job]);

  const setMark = (id: string, mark: JobMark) => {
    setJob((j) => ({ ...j, marks: { ...j.marks, [id]: mark } }));
  };
  const setNote = (id: string, note: string) => {
    setJob((j) => ({ ...j, notes: { ...j.notes, [id]: note } }));
  };

  const rows = useMemo(
    () =>
      jobItems.filter((it) => {
        if (kind !== "all" && it.kind !== kind) return false;
        if (filter === "run") {
          if (!it.crit) return false;
        } else if (filter !== "all") {
          if ((job.marks[it.id] ?? "todo") !== filter) return false;
        }
        const q = query.trim().toLowerCase();
        if (q && !`${it.label} ${it.sub}`.toLowerCase().includes(q)) return false;
        return true;
      }),
    [filter, kind, job.marks, query],
  );

  const counts = useMemo(() => {
    const c = { todo: 0, keep: 0, cut: 0, done: 0, run: 0 };
    for (const it of jobItems) {
      c[job.marks[it.id] ?? "todo"] += 1;
      if (it.crit) c.run += 1;
    }
    return c;
  }, [job.marks]);

  function download() {
    const blob = new Blob([exportJob(job)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "3600-rewire-job.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function upload() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        setJob(importJob(await file.text()));
      } catch {
        /* ignore */
      }
    };
    input.click();
  }

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">Rewire job</p>
          <h2 className="font-display text-3xl font-semibold">Keep · cut · done</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Mark every circuit, fuse, and relay. Notes stay on this device. Export a file if you switch machines.
          </p>
        </div>
        <div className="flex flex-wrap gap-1">
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xs border border-border px-3 text-sm hover:bg-raised" onClick={download}>
            <Download className="size-4" /> Export
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xs border border-border px-3 text-sm hover:bg-raised" onClick={upload}>
            <Upload className="size-4" /> Import
          </button>
          <button type="button" className="inline-flex h-10 items-center gap-2 rounded-xs border border-border px-3 text-sm hover:bg-raised" onClick={() => window.print()}>
            <Printer className="size-4" /> Print
          </button>
          <button
            type="button"
            className="inline-flex h-10 items-center rounded-xs border border-border px-3 text-sm hover:bg-raised"
            onClick={() => {
              setJob((j) => {
                const marks = { ...j.marks };
                for (const it of jobItems) {
                  if (it.id === "c-21") marks[it.id] = "cut";
                  else if (it.crit) marks[it.id] = "keep";
                }
                return { ...j, marks };
              });
            }}
          >
            Preset 7.3 run
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MARKS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setFilter(m.id)}
            className={cn(
              "rounded-md border px-3 py-2 text-left",
              filter === m.id ? "border-accent bg-raised" : "border-border bg-surface",
            )}
          >
            <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">{m.label}</p>
            <p className="font-display text-2xl">{counts[m.id]}</p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-1">
        {(["all", "run", "circuit", "fuse", "relay"] as const).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              if (k === "run") setFilter("run");
              else if (k === "all") {
                setKind("all");
                setFilter("all");
              } else setKind(k);
            }}
            className={cn(
              "h-9 rounded-xs border px-3 text-xs",
              (k === "run" && filter === "run") || (k !== "run" && kind === k && filter !== "run")
                ? "border-accent text-accent"
                : "border-border text-muted hover:text-fg",
            )}
          >
            {k === "run" ? "Engine run" : k}
          </button>
        ))}
      </div>

      <ul className="divide-y divide-border rounded-md border border-border bg-surface print:border-0">
        {rows.map((it) => {
          const mark = job.marks[it.id] ?? "todo";
          return (
            <li key={it.id} className="grid gap-2 px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-start">
              <div>
                <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">
                  {it.sub}
                  {it.crit ? " · RUN" : ""}
                </p>
                <p className="text-sm text-fg">{it.label}</p>
                <label className="mt-2 block">
                  <span className="sr-only">Note</span>
                  <textarea
                    value={job.notes[it.id] ?? ""}
                    onChange={(e) => setNote(it.id, e.target.value)}
                    rows={2}
                    placeholder="Shop note…"
                    className="w-full resize-y rounded-xs border border-border bg-raised px-2 py-1.5 text-sm text-fg placeholder:text-subtle print:border-0"
                  />
                </label>
              </div>
              <div className="flex flex-wrap gap-1">
                {MARKS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMark(it.id, m.id)}
                    className={cn(
                      "h-9 min-w-14 rounded-xs border px-2 text-xs",
                      mark === m.id ? "border-accent bg-accent text-accent-fg" : "border-border text-muted hover:text-fg",
                    )}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
