export function StatsCard({ title, value, accent = false }: { title: string; value: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-[0_8px_24px_rgba(0,0,0,0.22)] md:min-h-[118px] ${accent ? 'border-primary/35 bg-gradient-to-br from-primary/10 to-card' : 'border-border bg-card'}`}>
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{title}</p>
      <p className={`mt-3 text-3xl font-semibold leading-none ${accent ? 'text-primary' : 'text-white'}`}>{value}</p>
    </div>
  );
}
