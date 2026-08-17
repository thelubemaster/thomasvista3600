import { circuitToggles } from "@/data/world";
import { fuses } from "@/data/wiring";
import { relayFaces } from "@/data/relay-pins";

export type JobMark = "todo" | "keep" | "cut" | "done";

export type JobSave = {
  version: number;
  marks: Record<string, JobMark>;
  notes: Record<string, string>;
  updated: number;
};

const KEY = "ih-3600-job-v1";
const SAVE_VERSION = 1;

export type JobItem = {
  id: string;
  kind: "circuit" | "fuse" | "relay";
  label: string;
  sub: string;
  crit: boolean;
};

export const jobItems: JobItem[] = [
  ...circuitToggles.map((c) => ({
    id: `c-${c.id}`,
    kind: "circuit" as const,
    label: `${c.id}  ${c.title}`,
    sub: "Circuit",
    crit: c.crit,
  })),
  ...fuses.map((f) => ({
    id: `f-${f.id}`,
    kind: "fuse" as const,
    label: `${f.id}  ${f.cover}`,
    sub: `${f.size} · ${f.source}`,
    crit: f.engineCritical,
  })),
  ...relayFaces.map((r) => ({
    id: `r-${r.id}`,
    kind: "relay" as const,
    label: r.name,
    sub: `Relay ${r.tag}`,
    crit: r.engineCritical,
  })),
];

const empty = (): JobSave => ({ version: SAVE_VERSION, marks: {}, notes: {}, updated: Date.now() });

export function loadJob(): JobSave {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as JobSave;
    if (!parsed || typeof parsed !== "object") return empty();
    return {
      version: SAVE_VERSION,
      marks: parsed.marks ?? {},
      notes: parsed.notes ?? {},
      updated: parsed.updated ?? Date.now(),
    };
  } catch {
    return empty();
  }
}

export function saveJob(save: JobSave) {
  const next = { ...save, version: SAVE_VERSION, updated: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode */
  }
  return next;
}

export function exportJob(save: JobSave) {
  return JSON.stringify({ ...save, version: SAVE_VERSION, updated: Date.now() }, null, 2);
}

export function importJob(raw: string): JobSave {
  const parsed = JSON.parse(raw) as JobSave;
  if (!parsed || typeof parsed !== "object") throw new Error("Bad job file");
  return saveJob({
    version: SAVE_VERSION,
    marks: parsed.marks ?? {},
    notes: parsed.notes ?? {},
    updated: Date.now(),
  });
}

export const MARKS: { id: JobMark; label: string }[] = [
  { id: "todo", label: "Todo" },
  { id: "keep", label: "Keep" },
  { id: "cut", label: "Cut" },
  { id: "done", label: "Done" },
];
