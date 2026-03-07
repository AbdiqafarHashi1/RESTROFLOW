import { OrderStatus } from '@/types';

const styles: Record<OrderStatus, string> = {
  new: 'bg-warning/20 text-warning',
  confirmed: 'bg-blue-500/20 text-blue-400',
  preparing: 'bg-purple-500/20 text-purple-300',
  out_for_delivery: 'bg-orange-500/20 text-orange-300',
  delivered: 'bg-success/20 text-green-300',
  cancelled: 'bg-red-500/20 text-red-300',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs ${styles[status]}`}>{status.replaceAll('_', ' ')}</span>;
}
