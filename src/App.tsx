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

const APP_VERSION = "1.0.8";
const ORIGIN = "https://thelubemaster.github.io/thomasvista3600";
const APK = ORIGIN + "/3600-wiring.apk";

const TABS = [
  { id: "shop", label: "3D shop", short: "Shop" },
  { id: "job", label: "Job", short: "Job" },
  { id: "book", label: "Book", short: "Book" },
  { id: "wall", label: "Firewall", short: "Wall" },
  { id: "relays", label: "Relays", short: "Relays" },
  { id: "circuits", label: "All circuits", short: "Circuits" },
  { id: "pins", label: "Pin map", short: "Pins" },
  { id: "panel", label: "Fuse panel", short: "Fuses" },
  { id: "all", label: "Fuses & relays", short: "Table" },
] as const;

type Tab = (typeof TABS)[number]["id"];

const SEARCH_TABS: Tab[] = ["pins", "all", "circuits", "book", "job"];

function searchPlaceholder(tab: Tab) {
  if (tab === "pins") return "Pin, circuit, connector…";
  if (tab === "book") return "Any page in the book…";
  if (tab === "circuits") return "Circuit number…";
  if (tab === "job") return "Search the job…";
  return "Fuse or relay…";
}

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

      <header
        className="sticky top-0 z-40 border-b border-border bg-bg print:hidden"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center gap-2 px-3 py-2 sm:hidden">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] tracking-[0.16em] text-accent uppercase">3600 · T444E 7.3</p>
            <h1 className="truncate font-display text-lg font-semibold leading-tight">Circuit diagrams</h1>
          </div>
          <button
            type="button"
            onClick={() => setJumpOpen(true)}
            className="grid size-11 shrink-0 place-items-center rounded-sm border border-border text-muted"
            aria-label="Search the book"
          >
            <Search className="size-5" />
          </button>
        </div>

        <div className="mx-auto hidden max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:flex sm:px-6">
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
            className="inline-flex h-10 items-center rounded-xs border border-border px-3 font-mono text-[11px] text-muted"
          >
            Ctrl+K
          </button>
        </div>

        <div className="sm:mx-auto sm:flex sm:max-w-6xl sm:flex-wrap sm:items-center sm:gap-2 sm:px-6 sm:pb-4">
          <nav className="tab-strip flex gap-1 overflow-x-auto px-3 py-1.5 sm:flex-wrap sm:rounded-sm sm:border sm:border-border sm:bg-surface sm:p-1 sm:px-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={cn(
                  "relative h-11 shrink-0 rounded-xs px-3 text-sm font-medium transition-colors sm:h-auto sm:py-2",
                  tab === t.id
                    ? "bg-raised text-fg after:absolute after:inset-x-2 after:bottom-1 after:h-0.5 after:rounded-full after:bg-accent sm:after:hidden"
                    : "text-muted hover:text-fg",
                )}
              >
                <span className="sm:hidden">{t.short}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </nav>
          {SEARCH_TABS.includes(tab) ? (
            <label className="relative mx-3 mb-2 block sm:mx-0 sm:mb-0 sm:min-w-48 sm:flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder(tab)}
                className="h-11 w-full rounded-sm border border-border bg-surface pr-3 pl-10 text-sm text-fg placeholder:text-subtle"
              />
            </label>
          ) : null}
        </div>
      </header>

      <main
        className={cn("mx-auto min-w-0 px-3 py-3 sm:px-6 sm:py-8", tab === "shop" ? "max-w-7xl" : "max-w-6xl")}
        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
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
