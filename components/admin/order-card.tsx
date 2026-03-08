import Link from 'next/link';
import { Printer, MapPin, Phone } from 'lucide-react';
import { OrderStatusBadge } from '@/components/admin/order-status-badge';
import { PaymentStatusBadge } from '@/components/admin/payment-status-badge';
import { OrderQuickActions } from '@/components/admin/order-quick-actions';
import { formatCurrency, formatDateTime, formatTimeAgo } from '@/lib/formatters';
import type { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '@/types';

type OrderCardOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  order_type: OrderType;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  order_status: OrderStatus;
  total: number;
  created_at: string;
  customer_marked_paid?: boolean;
  area?: string | null;
  address?: string | null;
  notes?: string | null;
  item_summary?: string;
};

function getUrgencyClasses(order: OrderCardOrder) {
  if (order.order_status === 'delivered') {
    return 'border-border/70 bg-card/60 opacity-80';
  }

  if (order.payment_method === 'send_money' && order.payment_status === 'pending' && order.customer_marked_paid) {
    return 'border-blue-400/40 bg-blue-500/10 shadow-[0_0_0_1px_rgba(96,165,250,0.24)]';
  }

  if (order.order_status === 'new' && order.payment_status === 'pending') {
    const ageMs = Date.now() - new Date(order.created_at).getTime();
    if (ageMs > 1000 * 60 * 15) {
      return 'border-warning/50 bg-warning/10 shadow-[0_0_0_1px_rgba(178,125,18,0.25)]';
    }

    return 'border-primary/40 bg-primary/5';
  }

  return 'border-border bg-card';
}

export function OrderCard({ order, showActions = true }: { order: OrderCardOrder; showActions?: boolean }) {
  const canPrintReceipt = order.payment_method !== 'send_money' || order.payment_status === 'confirmed';

  return (
    <article className={`rounded-2xl border p-4 shadow-[0_6px_24px_rgba(0,0,0,0.22)] transition hover:border-primary/40 ${getUrgencyClasses(order)}`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/admin/orders/${order.id}`} className="text-base font-semibold tracking-tight hover:text-primary sm:text-lg">
              {order.order_number}
            </Link>
            <p className="text-xs text-muted">{formatDateTime(order.created_at)}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border bg-black/20 px-2.5 py-1 text-[11px] text-muted">{formatTimeAgo(order.created_at)}</span>
            {canPrintReceipt ? (
              <Link
                href={`/admin/orders/${order.id}/print`}
                target="_blank"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-black/20 text-muted transition hover:border-primary/40 hover:text-primary"
                aria-label={`Print receipt for order ${order.order_number}`}
              >
                <Printer className="h-4 w-4" />
              </Link>
            ) : (
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 bg-black/20 text-muted/50" title="Waiting for payment confirmation">
                <Printer className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-muted">{order.order_type.replace('_', ' ')} · {order.payment_method.replaceAll('_', ' ')}</p>

        <div className="space-y-1.5">
          <p className="text-base font-semibold">{order.customer_name}</p>
          <p className="flex items-center gap-2 text-sm text-muted"><Phone className="h-3.5 w-3.5" /> {order.customer_phone}</p>
          <p className="flex items-center gap-2 text-sm text-muted">
            <MapPin className="h-3.5 w-3.5" />
            {order.area || order.address || 'Pickup at restaurant'}
          </p>
          {order.item_summary ? <p className="text-sm text-muted">{order.item_summary}</p> : null}
        </div>

        <div className="rounded-xl border border-border/70 bg-black/20 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted">Total</p>
          <p className="mt-0.5 text-2xl font-semibold text-primary">{formatCurrency(Number(order.total))}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <PaymentStatusBadge status={order.payment_status} />
          <OrderStatusBadge status={order.order_status} />
          {order.payment_method === 'send_money' && order.payment_status === 'pending' && order.customer_marked_paid ? (
            <span className="rounded-full border border-blue-400/35 bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-200">Customer says paid</span>
          ) : null}
        </div>

        {showActions ? (
          <OrderQuickActions orderId={order.id} orderStatus={order.order_status} paymentStatus={order.payment_status} compact />
        ) : null}
      </div>
    </article>
  );
}
