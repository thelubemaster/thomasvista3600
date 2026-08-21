export const APP_VERSION = "1.2.8";
export const LIVE_ORIGIN = "https://thelubemaster.github.io/thomasvista3600";

export function cmpVer(a: string, b: string) {
  const pa = a.replace(/^v/i, "").split(/[.+-]/).map((x) => parseInt(x, 10) || 0);
  const pb = b.replace(/^v/i, "").split(/[.+-]/).map((x) => parseInt(x, 10) || 0);
  const n = Math.max(pa.length, pb.length);
  for (let i = 0; i < n; i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d > 0 ? 1 : -1;
  }
  return 0;
}

export async function wipeCaches() {
  try {
    if (navigator.serviceWorker) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
  } catch {
    /* ignore */
  }
  try {
    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
    }
  } catch {
    /* ignore */
  }
}

export async function applyLive() {
  await wipeCaches();
  window.location.replace(`${LIVE_ORIGIN}/?v=${Date.now()}`);
}

export async function fetchLiveVersion() {
  const res = await fetch(`${LIVE_ORIGIN}/version.json?t=${Date.now()}`, { cache: "no-store" });
  if (!res.ok) throw new Error("bad");
  const j = (await res.json()) as { version?: string; notes?: string };
  const version = String(j.version || "").replace(/^v/i, "");
  if (!version) throw new Error("empty");
  return { version, notes: j.notes || null };
}
