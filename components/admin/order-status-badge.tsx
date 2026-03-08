import { OrderStatus } from '@/types';

const styles: Record<OrderStatus, string> = {
  new: 'border-amber-400/35 bg-amber-500/15 text-amber-200',
  confirmed: 'border-blue-400/35 bg-blue-500/15 text-blue-200',
  preparing: 'border-violet-400/35 bg-violet-500/15 text-violet-200',
  out_for_delivery: 'border-orange-400/35 bg-orange-500/15 text-orange-200',
  delivered: 'border-emerald-400/35 bg-emerald-500/15 text-emerald-200',
  cancelled: 'border-red-400/35 bg-red-500/15 text-red-200',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${styles[status]}`}>{status.replaceAll('_', ' ')}</span>;
}
