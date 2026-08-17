import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN = 0.2;
const MAX = 5;
const DRAG = 5;

function clamp(n: number) {
  return Math.min(MAX, Math.max(MIN, n));
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function ZoomStage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(16);
  const [ty, setTy] = useState(16);
  const [panning, setPanning] = useState(false);

  const scaleRef = useRef(scale);
  const txRef = useRef(tx);
  const tyRef = useRef(ty);
  scaleRef.current = scale;
  txRef.current = tx;
  tyRef.current = ty;

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{
    id: number;
    px: number;
    py: number;
    tx: number;
    ty: number;
    moved: boolean;
  } | null>(null);
  const pinch = useRef<{
    dist: number;
    scale: number;
    tx: number;
    ty: number;
    cx: number;
    cy: number;
  } | null>(null);
  const suppressClick = useRef(false);

  const apply = useCallback((nextScale: number, nextTx: number, nextTy: number) => {
    const s = clamp(nextScale);
    scaleRef.current = s;
    txRef.current = nextTx;
    tyRef.current = nextTy;
    setScale(s);
    setTx(nextTx);
    setTy(nextTy);
  }, []);

  const zoomAt = useCallback(
    (clientX: number, clientY: number, next: number) => {
      const el = viewport.current;
      const s = clamp(next);
      if (!el) {
        apply(s, txRef.current, tyRef.current);
        return;
      }
      const r = el.getBoundingClientRect();
      const px = clientX - r.left;
      const py = clientY - r.top;
      const cur = scaleRef.current;
      apply(s, px - ((px - txRef.current) * s) / cur, py - ((py - tyRef.current) * s) / cur);
    },
    [apply],
  );

  const fitToView = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const svg = el.querySelector("svg");
    const cw = svg?.width.baseVal.value || svg?.viewBox.baseVal.width || 1320;
    const ch = svg?.height.baseVal.value || svg?.viewBox.baseVal.height || 520;
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    if (!vw || !vh || !cw || !ch) return;
    const pad = 20;
    const s = clamp(Math.min((vw - pad * 2) / cw, (vh - pad * 2) / ch));
    apply(s, (vw - cw * s) / 2, (vh - ch * s) / 2);
  }, [apply]);

  useEffect(() => {
    const id = requestAnimationFrame(fitToView);
    return () => cancelAnimationFrame(id);
  }, [fitToView]);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.88 : 1.14;
      zoomAt(e.clientX || 0, e.clientY || 0, scaleRef.current * factor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    const ro = new ResizeObserver(() => {
      // Keep the drawing on screen if the phone chrome resizes.
      if (pointers.current.size) return;
    });
    ro.observe(el);
    return () => {
      el.removeEventListener("wheel", onWheel);
      ro.disconnect();
    };
  }, [zoomAt]);

  function endPointer(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pinch.current && pointers.current.size < 2) pinch.current = null;
    const d = drag.current;
    if (d?.id === e.pointerId) {
      if (d.moved) {
        suppressClick.current = true;
        e.preventDefault();
        e.stopPropagation();
      }
      if (viewport.current?.hasPointerCapture(d.id)) {
        viewport.current.releasePointerCapture(d.id);
      }
      drag.current = null;
      setPanning(false);
    }
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border bg-surface", className)}>
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-sm border border-border bg-raised/95 p-1 shadow-sm">
        <button
          type="button"
          className="grid size-9 place-items-center rounded-xs text-muted hover:bg-surface hover:text-fg"
          aria-label="Zoom out"
          onClick={() => {
            const el = viewport.current;
            const r = el?.getBoundingClientRect();
            zoomAt((r?.left ?? 0) + (r?.width ?? 0) / 2, (r?.top ?? 0) + (r?.height ?? 0) / 2, scaleRef.current / 1.2);
          }}
        >
          <Minus className="size-4" />
        </button>
        <span className="min-w-12 text-center font-mono text-xs text-muted">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-xs text-muted hover:bg-surface hover:text-fg"
          aria-label="Zoom in"
          onClick={() => {
            const el = viewport.current;
            const r = el?.getBoundingClientRect();
            zoomAt((r?.left ?? 0) + (r?.width ?? 0) / 2, (r?.top ?? 0) + (r?.height ?? 0) / 2, scaleRef.current * 1.2);
          }}
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-xs text-muted hover:bg-surface hover:text-fg"
          aria-label="Fit drawing"
          onClick={fitToView}
        >
          <Maximize2 className="size-4" />
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-2 left-3 z-10 font-mono text-[10px] text-subtle">
        Drag to pan · pinch to zoom · tap a box
      </p>
      <div
        ref={viewport}
        className={cn(
          "h-[min(68svh,40rem)] touch-none overflow-hidden overscroll-none select-none",
          panning ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ touchAction: "none", WebkitUserSelect: "none" }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          if (pointers.current.size >= 2) {
            const pts = [...pointers.current.values()];
            const a = pts[0];
            const b = pts[1];
            const r = e.currentTarget.getBoundingClientRect();
            pinch.current = {
              dist: Math.max(1, dist(a, b)),
              scale: scaleRef.current,
              tx: txRef.current,
              ty: tyRef.current,
              cx: (a.x + b.x) / 2 - r.left,
              cy: (a.y + b.y) / 2 - r.top,
            };
            drag.current = null;
            setPanning(false);
            return;
          }
          drag.current = {
            id: e.pointerId,
            px: e.clientX,
            py: e.clientY,
            tx: txRef.current,
            ty: tyRef.current,
            moved: false,
          };
        }}
        onPointerMove={(e) => {
          if (pointers.current.has(e.pointerId)) {
            pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
          }
          if (pinch.current && pointers.current.size >= 2) {
            const pts = [...pointers.current.values()];
            const a = pts[0];
            const b = pts[1];
            const next = clamp(pinch.current.scale * (dist(a, b) / pinch.current.dist));
            const px = pinch.current.cx;
            const py = pinch.current.cy;
            apply(
              next,
              px - ((px - pinch.current.tx) * next) / pinch.current.scale,
              py - ((py - pinch.current.ty) * next) / pinch.current.scale,
            );
            suppressClick.current = true;
            return;
          }
          const d = drag.current;
          if (!d || e.pointerId !== d.id) return;
          const dx = e.clientX - d.px;
          const dy = e.clientY - d.py;
          if (!d.moved && dx * dx + dy * dy < DRAG * DRAG) return;
          if (!d.moved) {
            d.moved = true;
            setPanning(true);
          }
          apply(scaleRef.current, d.tx + dx, d.ty + dy);
        }}
        onPointerUp={endPointer}
        onPointerCancel={endPointer}
        onClickCapture={(e) => {
          if (!suppressClick.current) return;
          suppressClick.current = false;
          e.preventDefault();
          e.stopPropagation();
        }}
        onDoubleClick={(e) => zoomAt(e.clientX, e.clientY, scaleRef.current * 1.35)}
      >
        <div
          className="origin-top-left will-change-transform"
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
