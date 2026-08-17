const BOOK = `${import.meta.env.BASE_URL}cts-5123v.pdf`;

export function Manual(_props: { query?: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-raised">
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-surface px-3 py-2">
        <p className="min-w-0 truncate font-mono text-[11px] tracking-widest text-accent uppercase">
          CTS-5123V · AE-2811
        </p>
        <a
          href={BOOK}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-10 shrink-0 items-center rounded-xs border border-border px-3 text-sm text-fg hover:bg-raised"
        >
          Open PDF
        </a>
      </div>
      <div className="relative min-h-0 flex-1">
        <iframe
          title="Electrical Circuit Diagrams CTS-5123V"
          src={`${BOOK}#view=FitH`}
          className="absolute inset-0 h-full w-full border-0 bg-raised"
        />
      </div>
    </div>
  );
}
