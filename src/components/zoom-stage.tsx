import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN = 0.2;
const MAX = 5;
/** Finger jitter on a phone is bigger than 5px — don't start a pan that soon. */
const DRAG = 16;

function drawingSize(el: HTMLElement | null): { w: number; h: number } {
  const svg = el?.querySelector("svg");
  if (!svg) return { w: 1320, h: 520 };
  const dw = Number(svg.getAttribute("data-drawing-w"));
  const dh = Number(svg.getAttribute("data-drawing-h"));
  if (dw > 0 && dh > 0) return { w: dw, h: dh };
  const vb = svg.viewBox.baseVal;
  return { w: vb.width || 1320, h: vb.height || 520 };
}

function clamp(n: number) {
  return Math.min(MAX, Math.max(MIN, n));
}

function dist(a: { x: number; y: number }, b: { x: number; y: number }) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function ZoomStage({
  children,
  className,
  onTap,
}: {
  children: ReactNode;
  className?: string;
  onTap?: (clientX: number, clientY: number) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(16);
  const [ty, setTy] = useState(16);
  const [panning, setPanning] = useState(false);
  const [box, setBox] = useState({ w: 1320, h: 520 });

  const scaleRef = useRef(scale);
  const txRef = useRef(tx);
  const tyRef = useRef(ty);
  const onTapRef = useRef(onTap);
  scaleRef.current = scale;
  txRef.current = tx;
  tyRef.current = ty;
  onTapRef.current = onTap;

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
  const pinched = useRef(false);

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
    const size = drawingSize(el);
    setBox(size);
    const vw = el.clientWidth;
    const vh = el.clientHeight;
    if (!vw || !vh || !size.w || !size.h) return;
    const pad = 16;
    const s = clamp(Math.min((vw - pad * 2) / size.w, (vh - pad * 2) / size.h));
    apply(s, (vw - size.w * s) / 2, (vh - size.h * s) / 2);
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
      if (pointers.current.size) return;
      fitToView();
    });
    ro.observe(el);
    return () => {
      el.removeEventListener("wheel", onWheel);
      ro.disconnect();
    };
  }, [zoomAt, fitToView]);

  function endPointer(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    if (pinch.current && pointers.current.size < 2) {
      pinch.current = null;
      pinched.current = true;
    }
    const d = drag.current;
    if (d?.id === e.pointerId) {
      const wasTap = !d.moved && !pinched.current;
      if (d.moved || pinched.current) {
        suppressClick.current = true;
        e.preventDefault();
        e.stopPropagation();
      }
      if (viewport.current?.hasPointerCapture(d.id)) {
        viewport.current.releasePointerCapture(d.id);
      }
      drag.current = null;
      setPanning(false);
      if (wasTap && onTapRef.current) {
        suppressClick.current = true;
        onTapRef.current(e.clientX, e.clientY);
      }
    }
    if (pointers.current.size === 0) pinched.current = false;
  }

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-col overflow-hidden rounded-lg border border-border bg-surface",
        className ?? "h-[min(58svh,36rem)] sm:h-[min(68svh,40rem)]",
      )}
    >
      <div className="absolute top-1 right-1 z-10 flex items-center gap-0.5 rounded-xs border border-border bg-raised/95 p-0.5">
        <button
          type="button"
          className="grid size-8 place-items-center rounded-xs text-muted hover:bg-surface hover:text-fg"
          aria-label="Zoom out"
          onClick={() => {
            const el = viewport.current;
            const r = el?.getBoundingClientRect();
            zoomAt((r?.left ?? 0) + (r?.width ?? 0) / 2, (r?.top ?? 0) + (r?.height ?? 0) / 2, scaleRef.current / 1.2);
          }}
        >
          <Minus className="size-3.5" />
        </button>
        <span className="min-w-10 text-center font-mono text-[11px] text-muted">{Math.round(scale * 100)}%</span>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-xs text-muted hover:bg-surface hover:text-fg"
          aria-label="Zoom in"
          onClick={() => {
            const el = viewport.current;
            const r = el?.getBoundingClientRect();
            zoomAt((r?.left ?? 0) + (r?.width ?? 0) / 2, (r?.top ?? 0) + (r?.height ?? 0) / 2, scaleRef.current * 1.2);
          }}
        >
          <Plus className="size-3.5" />
        </button>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-xs text-muted hover:bg-surface hover:text-fg"
          aria-label="Fit drawing"
          onClick={fitToView}
        >
          <Maximize2 className="size-3.5" />
        </button>
      </div>
      <div
        ref={viewport}
        className={cn(
          "min-h-0 flex-1 touch-none overflow-hidden overscroll-none select-none",
          panning ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ touchAction: "none", WebkitUserSelect: "none" }}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse" && e.button !== 0) return;
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
            e.currentTarget.setPointerCapture(e.pointerId);
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
        <div style={{ transform: `translate(${tx}px, ${ty}px)` }}>
          <div style={{ width: box.w * scale, height: box.h * scale }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
