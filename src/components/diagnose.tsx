import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Cable, CircleAlert, Wrench } from "lucide-react";
import {
  dxFlow,
  dxFlows,
  dxLookalikes,
  dxResult,
  dxStep,
  isoPrimer,
  type DxJump,
} from "@/data/diagnose";
import { cn } from "@/lib/utils";

type Props = {
  onJump: (tab: DxJump["tab"], hint?: string) => void;
  startFlow?: string | null;
};

export function Diagnose({ onJump, startFlow }: Props) {
  const [dxStart, setDxStart] = useState(startFlow);
  const [flowId, setFlowId] = useState<string | null>(startFlow ?? null);
  const [stepId, setStepId] = useState<string | null>(
    startFlow ? (dxFlow(startFlow)?.start ?? null) : null,
  );
  const [resultId, setResultId] = useState<string | null>(null);
  const [ref, setRef] = useState<"iso" | "parts" | null>(null);

  useEffect(() => {
    if (!startFlow || startFlow === dxStart) return;
    setDxStart(startFlow);
    const f = dxFlow(startFlow);
    setFlowId(startFlow);
    setStepId(f?.start ?? null);
    setResultId(null);
    setRef(null);
  }, [startFlow, dxStart]);

  const flow = flowId ? dxFlow(flowId) : null;
  const step = stepId ? dxStep(stepId) : null;
  const result = resultId ? dxResult(resultId) : null;

  function openFlow(id: string) {
    const f = dxFlow(id);
    setFlowId(id);
    setStepId(f?.start ?? null);
    setResultId(null);
    setRef(null);
  }

  function home() {
    setFlowId(null);
    setStepId(null);
    setResultId(null);
    setRef(null);
  }

  function pick(c: { next?: string; result?: string }) {
    if (c.result) {
      setResultId(c.result);
      setStepId(null);
      return;
    }
    if (c.next) {
      setResultId(null);
      setStepId(c.next);
    }
  }

  const title = result?.title ?? step?.title ?? flow?.title ?? "Diagnose";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      <header className="space-y-1">
        <p className="font-mono text-[11px] tracking-[0.18em] text-accent uppercase">
          3600 · T444E · garage tree
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight">{title}</h2>
        {!flow && !ref ? (
          <p className="max-w-xl text-sm text-muted">
            Same tests we ran on this bus. Start from the symptom. Do not skip the “wrong part”
            checks — that is how 387 gets confused with a buzzer.
          </p>
        ) : null}
      </header>

      {flow || ref || result ? (
        <button
          type="button"
          onClick={home}
          className="inline-flex h-11 items-center gap-2 rounded-sm border border-border bg-surface px-3 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          All symptoms
        </button>
      ) : null}

      {!flow && !ref ? <Home onFlow={openFlow} onRef={setRef} /> : null}
      {ref === "iso" ? <IsoCard /> : null}
      {ref === "parts" ? <PartsCard /> : null}

      {flow && step && !result ? (
        <StepCard step={step} onPick={pick} onJump={onJump} />
      ) : null}

      {result ? (
        <ResultCard
          result={result}
          onJump={onJump}
          onAgain={() => {
            if (flow) openFlow(flow.id);
          }}
        />
      ) : null}
    </div>
  );
}

function Home({
  onFlow,
  onRef,
}: {
  onFlow: (id: string) => void;
  onRef: (id: "iso" | "parts") => void;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-2 sm:grid-cols-2">
        {dxFlows.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onFlow(f.id)}
            className="rounded-md border border-border bg-surface p-4 text-left transition-transform duration-150 ease-out hover:border-line active:scale-[0.99]"
          >
            <p className="font-mono text-[10px] tracking-widest text-subtle uppercase">
              {String(i + 1).padStart(2, "0")}
            </p>
            <p className="mt-1 font-display text-xl font-semibold">{f.title}</p>
            <p className="mt-1 text-sm text-muted">{f.blurb}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onRef("iso")}
          className="flex min-h-14 items-center gap-3 rounded-md border border-border bg-raised px-4 text-left"
        >
          <Cable className="size-4 shrink-0 text-accent" />
          <span>
            <span className="block font-medium">ISO 85 / 86 primer</span>
            <span className="block text-sm text-muted">Why voltage jumps over an open 85</span>
          </span>
        </button>
        <button
          type="button"
          onClick={() => onRef("parts")}
          className="flex min-h-14 items-center gap-3 rounded-md border border-border bg-raised px-4 text-left"
        >
          <CircleAlert className="size-4 shrink-0 text-warn" />
          <span>
            <span className="block font-medium">Not the start circuit</span>
            <span className="block text-sm text-muted">J30 vs J31, BAP, buzzers, CPS</span>
          </span>
        </button>
      </div>
    </div>
  );
}

function StepCard({
  step,
  onPick,
  onJump,
}: {
  step: NonNullable<ReturnType<typeof dxStep>>;
  onPick: (c: { next?: string; result?: string }) => void;
  onJump: (tab: DxJump["tab"], hint?: string) => void;
}) {
  return (
    <article className="space-y-4 rounded-lg border border-border bg-surface p-4 sm:p-5">
      <p className="text-sm text-muted">
        <span className="font-mono text-[10px] tracking-widest text-subtle uppercase">Where</span>
        <span className="mt-1 block text-fg">{step.where}</span>
      </p>
      <p className="text-sm text-muted">
        <span className="font-mono text-[10px] tracking-widest text-subtle uppercase">Do</span>
        <span className="mt-1 block text-fg">{step.do}</span>
      </p>
      <p className="text-sm text-muted">
        <span className="font-mono text-[10px] tracking-widest text-subtle uppercase">Expect</span>
        <span className="mt-1 block text-fg">{step.expect}</span>
      </p>
      {step.caution ? (
        <p className="rounded-sm border border-line bg-raised px-3 py-2 text-sm text-warn">{step.caution}</p>
      ) : null}

      {step.jumps?.length ? (
        <div className="flex flex-wrap gap-2">
          {step.jumps.map((j) => (
            <JumpChip key={j.label} jump={j} onJump={onJump} />
          ))}
        </div>
      ) : null}

      <div className="space-y-2 pt-1">
        {step.choices.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onPick(c)}
            className="flex min-h-12 w-full items-center rounded-sm bg-accent px-4 text-left text-sm font-medium text-accent-fg"
          >
            {c.label}
          </button>
        ))}
      </div>
    </article>
  );
}

function ResultCard({
  result,
  onJump,
  onAgain,
}: {
  result: NonNullable<ReturnType<typeof dxResult>>;
  onJump: (tab: DxJump["tab"], hint?: string) => void;
  onAgain: () => void;
}) {
  return (
    <article className="space-y-4 rounded-lg border border-accent/40 bg-surface p-4 sm:p-5">
      <p className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-accent uppercase">
        <Wrench className="size-3.5" />
        Call
      </p>
      <p className="text-sm leading-relaxed text-fg">{result.body}</p>
      {result.jumps?.length ? (
        <div className="flex flex-wrap gap-2">
          {result.jumps.map((j) => (
            <JumpChip key={j.label} jump={j} onJump={onJump} />
          ))}
        </div>
      ) : null}
      <button
        type="button"
        onClick={onAgain}
        className="h-11 w-full rounded-sm border border-border bg-raised text-sm text-muted"
      >
        Run this tree again
      </button>
    </article>
  );
}

function IsoCard() {
  return (
    <article className="space-y-3 rounded-lg border border-border bg-surface p-4 sm:p-5">
      <h3 className="font-display text-2xl font-semibold">{isoPrimer.title}</h3>
      <ul className="divide-y divide-border">
        {isoPrimer.pins.map((p) => (
          <li key={p.iso} className="flex gap-3 py-3">
            <span className="w-10 shrink-0 font-mono text-accent">{p.iso}</span>
            <span>
              <span className="block font-medium">{p.role}</span>
              <span className="block text-sm text-muted">{p.note}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="rounded-sm border border-line bg-raised px-3 py-2 text-sm text-muted">{isoPrimer.float}</p>
    </article>
  );
}

function PartsCard() {
  const items = useMemo(() => dxLookalikes, []);
  return (
    <article className="space-y-3 rounded-lg border border-border bg-surface p-4 sm:p-5">
      <h3 className="font-display text-2xl font-semibold">Do not mix these up</h3>
      <ul className="space-y-2">
        {items.map((p) => (
          <li key={p.id} className="rounded-sm border border-border bg-raised px-3 py-3">
            <p className="font-medium">{p.name}</p>
            <p className="mt-1 text-sm text-muted">{p.fact}</p>
          </li>
        ))}
      </ul>
    </article>
  );
}

function JumpChip({
  jump,
  onJump,
}: {
  jump: DxJump;
  onJump: (tab: DxJump["tab"], hint?: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onJump(jump.tab, jump.hint)}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-xs border border-border bg-raised px-3 font-mono text-[11px] text-muted hover:text-fg",
      )}
    >
      <BookOpen className="size-3.5" />
      {jump.label}
    </button>
  );
}
