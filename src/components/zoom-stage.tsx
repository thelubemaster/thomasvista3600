import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN = 0.7;
const MAX = 4;
const DRAG = 6;

function clamp(n: number) {
  return Math.min(MAX, Math.max(MIN, n));
}

export function ZoomStage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.85);
  const [tx, setTx] = useState(20);
  const [ty, setTy] = useState(20);
  const [panning, setPanning] = useState(false);
  const drag = useRef<{
    id: number;
    px: number;
    py: number;
    tx: number;
    ty: number;
    moved: boolean;
  } | null>(null);

  const zoomAt = useCallback((clientX: number, clientY: number, next: number) => {
    const el = viewport.current;
    const s = clamp(next);
    if (!el) {
      setScale(s);
      return;
    }
    const r = el.getBoundingClientRect();
    const px = clientX - r.left;
    const py = clientY - r.top;
    setTx((curTx) => {
      setTy((curTy) => py - ((py - curTy) * s) / scale);
      return px - ((px - curTx) * s) / scale;
    });
    setScale(s);
  }, [scale]);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.88 : 1.14;
      const r = el.getBoundingClientRect();
      zoomAt(e.clientX || r.left + r.width / 2, e.clientY || r.top + r.height / 2, scale * factor);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [scale, zoomAt]);

  function fit() {
    setScale(1.85);
    setTx(20);
    setTy(20);
  }

  function endPan(e: React.PointerEvent) {
    const d = drag.current;
    if (d?.moved) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (d && viewport.current?.hasPointerCapture(d.id)) {
      viewport.current.releasePointerCapture(d.id);
    }
    drag.current = null;
    setPanning(false);
  }

  return (
    <div className={cn("relative overflow-hidden rounded-lg border border-border bg-surface", className)}>
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 rounded-sm border border-border bg-raised/95 p-1 shadow-sm">
        <button
          type="button"
          className="grid size-9 place-items-center rounded-xs text-muted hover:bg-surface hover:text-fg"
          aria-label="Zoom out"
          onClick={() => setScale((s) => clamp(s / 1.2))}
        >
          <Minus className="size-4" />
        </button>
        <span className="min-w-12 text-center font-mono text-xs text-muted">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-xs text-muted hover:bg-surface hover:text-fg"
          aria-label="Zoom in"
          onClick={() => setScale((s) => clamp(s * 1.2))}
        >
          <Plus className="size-4" />
        </button>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-xs text-muted hover:bg-surface hover:text-fg"
          aria-label="Reset zoom"
          onClick={fit}
        >
          <Maximize2 className="size-4" />
        </button>
      </div>
      <p className="pointer-events-none absolute bottom-2 left-3 z-10 font-mono text-[10px] text-subtle">
        Click a box · scroll to zoom · drag empty space to pan
      </p>
      <div
        ref={viewport}
        className={cn(
          "h-[min(72vh,42rem)] overflow-hidden",
          panning ? "cursor-grabbing" : "cursor-default",
        )}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          drag.current = { id: e.pointerId, px: e.clientX, py: e.clientY, tx, ty, moved: false };
        }}
        onPointerMove={(e) => {
          const d = drag.current;
          if (!d || e.pointerId !== d.id) return;
          const dx = e.clientX - d.px;
          const dy = e.clientY - d.py;
          if (!d.moved && dx * dx + dy * dy < DRAG * DRAG) return;
          if (!d.moved) {
            d.moved = true;
            setPanning(true);
            e.currentTarget.setPointerCapture(e.pointerId);
          }
          setTx(d.tx + dx);
          setTy(d.ty + dy);
        }}
        onPointerUp={endPan}
        onPointerCancel={endPan}
        onDoubleClick={(e) => zoomAt(e.clientX, e.clientY, scale * 1.35)}
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
