import { useState } from "react";
import { cn } from "@/lib/utils";

export const APP_VERSION = "1.1.5";
const LIVE = "https://thelubemaster.github.io/thomasvista3600";

function cmpVer(a: string, b: string) {
  const pa = a.replace(/^v/i, "").split(/[.+-]/).map((x) => parseInt(x, 10) || 0);
  const pb = b.replace(/^v/i, "").split(/[.+-]/).map((x) => parseInt(x, 10) || 0);
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}

type Status = "checking" | "current" | "available" | "error";

export function VersionBadge({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("checking");
  const [remote, setRemote] = useState("");
  const [notes, setNotes] = useState("");

  async function check() {
    setStatus("checking");
    setRemote("");
    setNotes("");
    try {
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update()));
      }
      const res = await fetch(`${LIVE}/version.json?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("bad");
      const j = (await res.json()) as { version?: string; notes?: string };
      const v = String(j.version || "").replace(/^v/i, "");
      setRemote(v);
      setNotes(String(j.notes || ""));
      setStatus(cmpVer(v, APP_VERSION) > 0 ? "available" : "current");
    } catch {
      setStatus("error");
    }
  }

  function openSheet() {
    setOpen(true);
    void check();
  }

  function apply() {
    window.location.replace(`${LIVE}/?updated=${Date.now()}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className={cn(
          "shrink-0 rounded-xs border border-border bg-raised px-2 py-1 font-mono text-xs text-fg sm:px-2.5 sm:py-1.5 sm:text-sm",
          className,
        )}
        aria-label={`Version ${APP_VERSION}, check for update`}
      >
        v{APP_VERSION}
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] grid place-items-end bg-bg/70 sm:place-items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full rounded-t-lg border border-border bg-surface p-5 shadow-lg sm:max-w-sm sm:rounded-md"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="update-title"
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-line sm:hidden" aria-hidden />
            <p id="update-title" className="font-mono text-[10px] tracking-widest text-accent uppercase">
              This copy
            </p>
            <h2 className="mt-1 font-display text-2xl font-semibold">v{APP_VERSION}</h2>

            {status === "checking" ? (
              <p className="mt-3 text-sm text-muted">Checking for an update…</p>
            ) : null}
            {status === "current" ? (
              <p className="mt-3 text-sm text-muted">You’re on the latest.</p>
            ) : null}
            {status === "available" ? (
              <p className="mt-3 text-sm text-muted">
                Update available: <span className="font-mono text-fg">v{remote}</span>
                {notes ? <span className="mt-1 block">{notes}</span> : null}
              </p>
            ) : null}
            {status === "error" ? (
              <p className="mt-3 text-sm text-muted">Couldn’t reach the update check. Try again when you’re online.</p>
            ) : null}

            <div className="mt-5 flex gap-2">
              {status === "available" ? (
                <button
                  type="button"
                  onClick={apply}
                  className="h-11 flex-1 rounded-xs bg-accent px-4 text-sm font-semibold text-accent-fg"
                >
                  Update now
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void check()}
                  className="h-11 flex-1 rounded-xs border border-border px-4 text-sm text-fg"
                >
                  Check again
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 rounded-xs border border-border px-4 text-sm text-muted"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
