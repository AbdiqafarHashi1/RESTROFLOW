'use client';

export function PrintReportButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-primary/60 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary hover:bg-primary/25 print:hidden"
    >
      Print report
    </button>
  );
}
