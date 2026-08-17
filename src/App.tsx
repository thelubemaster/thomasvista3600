import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AllCircuits } from "@/components/all-circuits";
import { CircuitTable } from "@/components/circuit-table";
import { CommandJump, type JumpTab } from "@/components/command-jump";
import { Firewall } from "@/components/firewall";
import { FusePanel } from "@/components/fuse-panel";
import { JobBook } from "@/components/job-book";
import { Manual } from "@/components/manual";
import { PinMap } from "@/components/pin-map";
import { RelayPanel } from "@/components/relay-panel";
import { Shop3D } from "@/components/shop-3d";
import { cn } from "@/lib/utils";

const APP_VERSION = "1.0.7";
const ORIGIN = "https://thelubemaster.github.io/thomasvista3600";
const APK = ORIGIN + "/3600-wiring.apk";

const TABS = [
  { id: "shop", label: "3D shop" },
  { id: "job", label: "Job" },
  { id: "book", label: "Book" },
  { id: "wall", label: "Firewall" },
  { id: "relays", label: "Relays" },
  { id: "circuits", label: "All circuits" },
  { id: "pins", label: "Pin map" },
  { id: "panel", label: "Fuse panel" },
  { id: "all", label: "Fuses & relays" },
] as const;

type Tab = (typeof TABS)[number]["id"];

function isAndroid() {
  return /Android/i.test(navigator.userAgent);
}
function isIos() {
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  return navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1;
}
function isNative() {
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean; getPlatform?: () => string } }).Capacitor;
  if (cap?.isNativePlatform?.()) return true;
  const p = cap?.getPlatform?.();
  if (p === "android" || p === "ios") return true;
  return /Android/i.test(navigator.userAgent) && /; wv\)/i.test(navigator.userAgent);
}
function isStandalone() {
  if (isNative()) return true;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  if ((navigator as Navigator & { standalone?: boolean }).standalone) return true;
  return document.referrer.includes("android-app://");
}

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

function applyLive() {
  const url = ORIGIN + "/?updated=" + Date.now();
  window.location.replace(url);
}

export default function App() {
  const [tab, setTab] = useState<Tab>("shop");
  const [fuse, setFuse] = useState<string | null>("E3");
  const [query, setQuery] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [banner, setBanner] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let skip = false;
    try {
      skip = localStorage.getItem("wiring-skip-installer") === "1";
    } catch {
      /* ignore */
    }
    if (params.get("install") === "1") {
      setBanner(true);
      return;
    }
    if (!skip && !isStandalone() && (isAndroid() || isIos())) {
      setBanner(true);
    }
  }, []);

  useEffect(() => {
    if (isNative() && !location.href.startsWith(ORIGIN)) {
      applyLive();
      return;
    }

    const params = new URLSearchParams(location.search);
    const justUpdated = params.has("updated");
    let gone = false;

    async function check() {
      try {
        if (navigator.serviceWorker) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.update()));
        }
        const res = await fetch(ORIGIN + "/version.json?t=" + Date.now(), { cache: "no-store" });
        if (!res.ok) return;
        const j = (await res.json()) as { version?: string };
        const remote = String(j.version || "").replace(/^v/i, "");
        if (gone) return;
        if (cmpVer(remote, APP_VERSION) > 0 && !justUpdated) {
          applyLive();
        }
      } catch {
        /* offline */
      }
    }
    void check();
    const vis = () => {
      if (document.visibilityState === "visible") void check();
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      gone = true;
      document.removeEventListener("visibilitychange", vis);
    };
  }, []);

  function jump(next: JumpTab, nextHint?: string) {
    setTab(next);
    setHint(nextHint ?? null);
    if (next === "panel" && nextHint) setFuse(nextHint);
    if (next === "circuits" && nextHint) setQuery(nextHint);
  }

  function dismissBanner() {
    try {
      localStorage.setItem("wiring-skip-installer", "1");
    } catch {
      /* ignore */
    }
    setBanner(false);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg text-fg">
      {banner ? (
        <div className="border-b border-border bg-raised print:hidden">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="text-sm">
              Put 3600 Wiring on the home screen. Same shop-manual.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {isAndroid() || !isIos() ? (
                <a href={APK} download="3600-wiring.apk" className="inline-flex min-h-11 items-center rounded-sm bg-accent px-4 text-sm font-semibold text-accent-fg">
                  Download
                </a>
              ) : (
                <span className="text-sm text-muted">Safari → Share → Add to Home Screen</span>
              )}
              <button type="button" className="min-h-11 px-3 text-sm text-muted underline" onClick={dismissBanner}>
                Not now
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <header className="border-b border-border print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">
              3600 · T444E 7.3 POWER STROKE · W/004040 HYD BRAKES · AE-2811
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Electrical Circuit Diagrams</h1>
            <p className="mt-1 text-sm text-muted">Locked to the 7.3 T444E. Press Ctrl+K to jump. Job saves keep / cut / done on this device.</p>
          </div>
          <button
            type="button"
            onClick={() => setJumpOpen(true)}
            className="hidden h-10 items-center rounded-xs border border-border px-3 font-mono text-[11px] text-muted sm:inline-flex"
          >
            Ctrl+K
          </button>
        </div>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 pb-4 sm:px-6">
          <nav className="flex flex-wrap gap-1 rounded-sm border border-border bg-surface p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "rounded-xs px-3 py-2 text-sm font-medium transition-colors",
                  tab === t.id ? "bg-raised text-fg" : "text-muted hover:text-fg",
                )}
              >
                {t.label}
              </button>
            ))}
          </nav>
          {tab === "pins" || tab === "all" || tab === "circuits" || tab === "book" || tab === "job" ? (
            <label className="relative min-w-48 flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={
                  tab === "pins"
                    ? "Search pin, circuit, connector…"
                    : tab === "book"
                      ? "Search any page in the book…"
                      : tab === "circuits"
                        ? "Search circuit number…"
                        : tab === "job"
                          ? "Search the job…"
                          : "Search fuse or relay…"
                }
                className="h-11 w-full rounded-sm border border-border bg-surface pr-3 pl-10 text-sm text-fg placeholder:text-subtle"
              />
            </label>
          ) : null}
        </div>
      </header>

      <main className={cn("mx-auto min-w-0 px-4 py-6 sm:px-6 sm:py-8", tab === "shop" ? "max-w-7xl" : "max-w-6xl")}>
        {tab === "shop" ? <Shop3D /> : null}
        {tab === "job" ? <JobBook query={query} /> : null}
        {tab === "book" ? <Manual query={query} /> : null}
        {tab === "wall" ? <Firewall focus={hint} /> : null}
        {tab === "relays" ? <RelayPanel focus={hint} /> : null}
        {tab === "circuits" ? <AllCircuits query={query} focus={hint} /> : null}
        {tab === "pins" ? <PinMap query={query} /> : null}
        {tab === "panel" ? <FusePanel selected={fuse} onSelect={setFuse} /> : null}
        {tab === "all" ? <CircuitTable query={query} /> : null}
      </main>

      <CommandJump open={jumpOpen} onOpen={setJumpOpen} onJump={jump} />
    </div>
  );
}
