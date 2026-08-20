import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { AllCircuits } from "@/components/all-circuits";
import { CircuitTable } from "@/components/circuit-table";
import { CommandJump, type JumpTab } from "@/components/command-jump";
import { BookPlugs } from "@/components/book-plugs";
import { Diagnose } from "@/components/diagnose";
import { FusePanel } from "@/components/fuse-panel";
import { JobBook } from "@/components/job-book";
import { Manual } from "@/components/manual";
import { RelayPanel } from "@/components/relay-panel";
import { Shop3D } from "@/components/shop-3d";
import { VersionBadge } from "@/components/version-badge";
import { APP_VERSION, LIVE_ORIGIN, applyLive, cmpVer, fetchLiveVersion } from "@/lib/live-update";
import { cn } from "@/lib/utils";

const ORIGIN = LIVE_ORIGIN;
const APK = ORIGIN + "/3600-wiring.apk";

const TABS = [
  { id: "dx", label: "Dx" },
  { id: "shop", label: "Shop" },
  { id: "circuits", label: "Circuits" },
  { id: "fuses", label: "Fuses" },
  { id: "book", label: "Book" },
  { id: "job", label: "Job" },
] as const;

type Tab = (typeof TABS)[number]["id"];
type CircuitView = "draw" | "plugs";
type FuseView = "cover" | "relays" | "table";

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

export default function App() {
  const [tab, setTab] = useState<Tab>("shop");
  const [fuse, setFuse] = useState<string | null>("E3");
  const [query, setQuery] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [banner, setBanner] = useState(false);
  const [circuitView, setCircuitView] = useState<CircuitView>("draw");
  const [fuseView, setFuseView] = useState<FuseView>("cover");
  const [dxStart, setDxStart] = useState<string | null>(null);
  const [liveUpdate, setLiveUpdate] = useState<string | null>(null);

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
    const onLiveHost = location.hostname.endsWith("github.io") || isNative();
    if (isNative() && onLiveHost && !location.href.startsWith(ORIGIN)) {
      void applyLive();
      return;
    }
    if (!onLiveHost) return;

    let gone = false;

    async function check() {
      try {
        if (navigator.serviceWorker) {
          const regs = await navigator.serviceWorker.getRegistrations();
          await Promise.all(regs.map((r) => r.update()));
        }
        const j = await fetchLiveVersion();
        if (gone) return;
        if (cmpVer(j.version, APP_VERSION) <= 0) {
          setLiveUpdate(null);
          return;
        }
        setLiveUpdate(j.version);
        let already = false;
        try {
          already = sessionStorage.getItem("wiring-applied-" + j.version) === "1";
        } catch {
          /* ignore */
        }
        if (already) return;
        try {
          sessionStorage.setItem("wiring-applied-" + j.version, "1");
        } catch {
          /* ignore */
        }
        await applyLive();
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
    setHint(nextHint ?? null);
    setQuery("");
    if (next === "dx") {
      setTab("dx");
      setDxStart(nextHint ?? null);
    } else if (next === "shop") {
      setTab("shop");
    } else if (next === "job") setTab("job");
    else if (next === "book") setTab("book");
    else if (next === "circuits") {
      setTab("circuits");
      setCircuitView("draw");
      if (nextHint) setQuery(nextHint);
    } else if (next === "wall" || next === "pins") {
      setTab("circuits");
      setCircuitView("plugs");
    } else if (next === "relays") {
      setTab("fuses");
      setFuseView("relays");
    } else if (next === "all") {
      setTab("fuses");
      setFuseView("table");
    } else {
      setTab("fuses");
      setFuseView("cover");
      if (nextHint) setFuse(nextHint);
    }
  }

  function dismissBanner() {
    try {
      localStorage.setItem("wiring-skip-installer", "1");
    } catch {
      /* ignore */
    }
    setBanner(false);
  }

  const showSearch = tab === "job" || tab === "circuits" || tab === "book" || (tab === "fuses" && fuseView === "table");

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-bg text-fg">
      {liveUpdate ? (
        <div className="border-b border-accent bg-raised print:hidden">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="text-sm">
              Live site is v{liveUpdate}. This device is still v{APP_VERSION}.
            </p>
            <button
              type="button"
              className="inline-flex min-h-11 items-center rounded-sm bg-accent px-4 text-sm font-semibold text-accent-fg"
              onClick={() => void applyLive()}
            >
              Load update
            </button>
          </div>
        </div>
      ) : null}
      {banner ? (
        <div className="border-b border-border bg-raised print:hidden">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <p className="text-sm">Put 3600 Wiring on the home screen. Same shop-manual.</p>
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
        className="sticky top-0 z-40 shrink-0 border-b border-border bg-bg print:hidden"
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center gap-2 px-3 py-2 sm:hidden">
          <p className="min-w-0 flex-1 truncate font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
            3600 · T444E 7.3
          </p>
          <VersionBadge />
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
            <h1 className="font-display text-3xl font-semibold tracking-tight">Electrical Circuit Diagrams</h1>
          </div>
          <div className="flex items-center gap-2">
            <VersionBadge />
            <button
              type="button"
              onClick={() => setJumpOpen(true)}
              className="inline-flex h-10 items-center rounded-xs border border-border px-3 font-mono text-[11px] text-muted"
            >
              Ctrl+K
            </button>
          </div>
        </div>

        <nav className="grid grid-cols-6 gap-0.5 px-2 pb-2 sm:mx-auto sm:flex sm:max-w-6xl sm:gap-1 sm:px-6 sm:pb-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "h-11 rounded-xs text-sm font-medium sm:h-auto sm:px-4 sm:py-2",
                tab === t.id ? "bg-raised text-fg" : "text-muted hover:text-fg",
              )}
            >
              {t.label}
            </button>
          ))}
        </nav>
        {showSearch ? (
          <label className="mx-3 mb-2 block sm:mx-auto sm:max-w-6xl sm:px-6">
            <span className="sr-only">Search</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                tab === "job"
                  ? "Job item…"
                  : tab === "circuits"
                    ? "Circuit 17, starter, tach…"
                    : tab === "book"
                      ? "Page 20, overcrank, 387…"
                      : "Fuse or circuit…"
              }
              className="h-11 w-full rounded-sm border border-border bg-surface px-3 text-sm text-fg placeholder:text-subtle"
            />
          </label>
        ) : null}
      </header>

      <main
        className={cn(
          "min-h-0 min-w-0 flex-1",
          tab === "book"
            ? "flex flex-col overflow-hidden"
            : cn("overflow-auto px-3 py-3 sm:px-6 sm:py-8", tab === "shop" ? "mx-auto w-full max-w-7xl" : "mx-auto w-full max-w-6xl"),
        )}
        style={{ paddingBottom: tab === "book" ? 0 : "max(1rem, env(safe-area-inset-bottom))" }}
      >
        {tab === "dx" ? <Diagnose onJump={jump} startFlow={dxStart} /> : null}
        {tab === "shop" ? <Shop3D /> : null}
        {tab === "circuits" ? (
          <div className="space-y-3">
            <Seg
              value={circuitView}
              onChange={setCircuitView}
              items={[
                ["draw", "Drawings"],
                ["plugs", "Plugs"],
              ]}
            />
            {circuitView === "draw" ? <AllCircuits query={query} focus={hint} /> : <BookPlugs focus={hint} />}
          </div>
        ) : null}
        {tab === "fuses" ? (
          <div className="space-y-3">
            <Seg
              value={fuseView}
              onChange={setFuseView}
              items={[
                ["cover", "Cover"],
                ["relays", "Relays"],
                ["table", "Table"],
              ]}
            />
            {fuseView === "cover" ? <FusePanel selected={fuse} onSelect={setFuse} /> : null}
            {fuseView === "relays" ? <RelayPanel focus={hint} /> : null}
            {fuseView === "table" ? <CircuitTable query={query} /> : null}
          </div>
        ) : null}
        {tab === "book" ? <Manual query={query} /> : null}
        {tab === "job" ? <JobBook query={query} /> : null}
      </main>

      <CommandJump open={jumpOpen} onOpen={setJumpOpen} onJump={jump} />
    </div>
  );
}

function Seg<T extends string>({
  value,
  onChange,
  items,
}: {
  value: T;
  onChange: (v: T) => void;
  items: readonly (readonly [T, string])[];
}) {
  return (
    <div className="flex gap-1 rounded-sm border border-border bg-surface p-1">
      {items.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            "h-10 flex-1 rounded-xs text-sm font-medium",
            value === id ? "bg-raised text-fg" : "text-muted hover:text-fg",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
