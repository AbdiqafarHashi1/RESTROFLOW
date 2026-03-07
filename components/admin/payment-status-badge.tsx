import { PaymentStatus } from '@/types';

const styles: Record<PaymentStatus, string> = {
  not_required: 'bg-slate-500/20 text-slate-200',
  pending: 'bg-amber-500/20 text-amber-300',
  confirmed: 'bg-green-500/20 text-green-300',
  failed: 'bg-red-500/20 text-red-300',
};

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs ${styles[status]}`}>{status.replaceAll('_', ' ')}</span>;
}
