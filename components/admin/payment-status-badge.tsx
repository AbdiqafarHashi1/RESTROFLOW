import { PaymentStatus } from '@/types';

const styles: Record<PaymentStatus, string> = {
  not_required: 'border-slate-400/35 bg-slate-500/15 text-slate-200',
  pending: 'border-amber-400/35 bg-amber-500/15 text-amber-200',
  confirmed: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200',
  failed: 'border-red-400/35 bg-red-500/15 text-red-200',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles[status]}`}>{status.replaceAll('_', ' ')}</span>;
}
