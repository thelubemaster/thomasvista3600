import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export const APP_VERSION = "1.1.8";
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

type Status = "idle" | "checking" | "current" | "available" | "error";

export function VersionBadge({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [live, setLive] = useState<string | null>(null);
  const [notes, setNotes] = useState<string | null>(null);

  async function check() {
    setStatus("checking");
    setLive(null);
    setNotes(null);
    try {
      const res = await fetch(`${LIVE}/version.json?t=${Date.now()}`, { cache: "no-store" });
      if (!res.ok) throw new Error("bad");
      const j = (await res.json()) as { version?: string; notes?: string };
      const v = String(j.version || "").replace(/^v/i, "");
      if (!v) throw new Error("empty");
      setLive(v);
      setNotes(j.notes || null);
      setStatus(cmpVer(v, APP_VERSION) > 0 ? "available" : "current");
    } catch {
      setStatus("error");
    }
  }

  function openSheet() {
    setOpen(true);
    void check();
  }

  function updateNow() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        reg?.waiting?.postMessage({ type: "SKIP_WAITING" });
      });
    }
    const url = `${LIVE}/?updated=${Date.now()}`;
    window.location.replace(url);
  }

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className={cn(
          "inline-flex min-h-11 items-center gap-1.5 rounded-xs border border-border bg-surface px-2.5 font-mono text-xs text-muted hover:border-accent hover:text-fg",
          className,
        )}
        aria-label={`Version ${APP_VERSION}. Check for update`}
      >
        <RefreshCw className="size-3.5 shrink-0 opacity-70" aria-hidden />
        v{APP_VERSION}
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-t-lg border border-border bg-bg p-4 shadow-xl sm:rounded-lg">
            <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">App version</p>
            <h2 className="mt-1 font-display text-2xl font-semibold">v{APP_VERSION}</h2>
            <p className="mt-1 text-sm text-muted">This device</p>

            <div className="mt-4 rounded-md border border-border bg-surface p-3">
              {status === "checking" ? (
                <p className="text-sm text-muted">Checking live site…</p>
              ) : null}
              {status === "current" ? (
                <p className="text-sm text-fg">
                  Live site · v{live}
                  <span className="mt-1 block text-muted">You are up to date.</span>
                </p>
              ) : null}
              {status === "available" ? (
                <div className="space-y-2">
                  <p className="text-sm text-fg">
                    Live site · v{live}
                    <span className="mt-1 block text-accent">Update available.</span>
                  </p>
                  {notes ? <p className="text-xs text-muted">{notes}</p> : null}
                  <button
                    type="button"
                    onClick={updateNow}
                    className="h-11 w-full rounded-xs bg-accent font-medium text-accent-fg"
                  >
                    Update now
                  </button>
                </div>
              ) : null}
              {status === "error" ? (
                <p className="text-sm text-muted">Could not reach the live site. Try again later.</p>
              ) : null}
              {status === "idle" ? <p className="text-sm text-muted">Tap check.</p> : null}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => void check()}
                className="h-11 flex-1 rounded-xs border border-border bg-surface text-sm text-fg"
              >
                Check again
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 flex-1 rounded-xs border border-border bg-raised text-sm text-muted"
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
