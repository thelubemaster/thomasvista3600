import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { printedToPdfPage } from "@/lib/book-pdf";

GlobalWorkerOptions.workerSrc = workerSrc;

const BOOK = `${import.meta.env.BASE_URL}cts-5123v.pdf`;

let docPromise: Promise<PDFDocumentProxy> | null = null;

function loadBook(onProgress?: (loaded: number, total: number) => void) {
  if (!docPromise) {
    const task = getDocument({ url: BOOK, withCredentials: false });
    if (onProgress) {
      task.onProgress = (p: { loaded: number; total: number }) => {
        onProgress(p.loaded, p.total || 1);
      };
    }
    docPromise = task.promise.catch((err) => {
      docPromise = null;
      throw err;
    });
  }
  return docPromise;
}

export function BookPage({
  printed,
  onBack,
}: {
  printed: string;
  onBack: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [pdfPage, setPdfPage] = useState(() => printedToPdfPage(printed));
  const [pageCount, setPageCount] = useState(0);
  const [width, setWidth] = useState(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    setPdfPage(printedToPdfPage(printed));
  }, [printed]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => setWidth(el.clientWidth || window.innerWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let gone = false;
    const canvas = canvasRef.current;
    if (!canvas || width < 160) return;

    setStatus("loading");
    setErr(null);

    void (async () => {
      try {
        const pdf = await loadBook((loaded, total) => {
          if (!gone && total) setPct(Math.min(99, Math.round((loaded / total) * 100)));
        });
        if (gone) return;
        setPageCount(pdf.numPages);
        const index = Math.max(1, Math.min(pdf.numPages, pdfPage));
        const page = await pdf.getPage(index);
        if (gone) return;
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        const unscaled = page.getViewport({ scale: 1 });
        const scale = (width * dpr) / unscaled.width;
        const viewport = page.getViewport({ scale });
        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);
        canvas.style.width = "100%";
        canvas.style.height = "auto";
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no canvas");
        await page.render({ canvasContext: ctx, viewport }).promise;
        if (!gone) {
          setPct(100);
          setStatus("ready");
        }
      } catch (e) {
        if (gone) return;
        setErr(e instanceof Error ? e.message : "Could not open the book");
        setStatus("error");
      }
    })();

    return () => {
      gone = true;
    };
  }, [pdfPage, width]);

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-raised">
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface px-2 py-2">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex h-11 items-center gap-1 rounded-xs border border-border px-3 text-sm text-fg"
        >
          <ChevronLeft className="size-4" />
          Index
        </button>
        <p className="min-w-0 flex-1 truncate font-mono text-[11px] tracking-widest text-accent uppercase">
          Printed p.{printed} · file {pdfPage}
        </p>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-xs border border-border text-fg disabled:opacity-40"
          aria-label="Previous page"
          disabled={pdfPage <= 1}
          onClick={() => setPdfPage((p) => Math.max(1, p - 1))}
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-xs border border-border text-fg disabled:opacity-40"
          aria-label="Next page"
          disabled={pageCount > 0 && pdfPage >= pageCount}
          onClick={() => setPdfPage((p) => p + 1)}
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div ref={wrapRef} className="min-h-0 flex-1 overflow-auto overscroll-contain bg-[#f4f0e6]">
        {status === "loading" ? (
          <div className="flex h-full min-h-48 flex-col items-center justify-center gap-2 px-4 text-sm text-muted">
            <Loader2 className="size-6 animate-spin text-accent" />
            <p>Opening CTS-5123V… {pct ? `${pct}%` : ""}</p>
            <p className="text-xs text-subtle">First open downloads the book. After that, pages flip here.</p>
          </div>
        ) : null}
        {status === "error" ? (
          <div className="space-y-3 p-4 text-sm">
            <p className="text-fg">Could not show this page in the app.</p>
            <p className="text-muted">{err}</p>
            <a href={BOOK} className="inline-flex h-11 items-center rounded-sm bg-accent px-4 font-medium text-accent-fg">
              Open the PDF file
            </a>
          </div>
        ) : null}
        <canvas ref={canvasRef} className={status === "ready" ? "mx-auto block" : "hidden"} />
      </div>
    </div>
  );
}
