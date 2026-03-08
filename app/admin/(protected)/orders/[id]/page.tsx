import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Printer } from 'lucide-react';
import { OrderStatusBadge } from '@/components/admin/order-status-badge';
import { PaymentStatusBadge } from '@/components/admin/payment-status-badge';
import { createServerClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { updateOrderStatuses } from '@/actions/admin';
import { OrderQuickActions } from '@/components/admin/order-quick-actions';

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();

  const { data: order } = await supabase
    .from('orders')
    .select('id,order_number,customer_name,customer_phone,order_type,payment_method,payment_status,order_status,area,address,notes,subtotal,delivery_fee,total,created_at,customer_marked_paid')
    .eq('id', params.id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from('order_items')
    .select('id,item_name,quantity,unit_price,total_price')
    .eq('order_id', order.id);

  const normalizedPhone = order.customer_phone.replace(/\s+/g, '').replace('+', '');
  const canPrintReceipt = order.payment_method !== 'send_money' || order.payment_status === 'confirmed';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Order {order.order_number}</h1>
          <p className="text-sm text-muted">Created {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.order_status} />
          <PaymentStatusBadge status={order.payment_status} />
          {order.customer_marked_paid && <span className="rounded-full border border-blue-400/35 bg-blue-500/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-blue-200">customer marked paid</span>}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_1fr]">
        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Customer Information</p>
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-lg font-semibold">{order.customer_name}</p>
              <p>{order.customer_phone}</p>
              <p className="text-muted">{order.order_type.replace('_', ' ')} · {order.payment_method.replaceAll('_', ' ')}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={`tel:${order.customer_phone}`} className="btn-secondary px-3 py-2 text-xs">Call Customer</a>
              <a href={`https://wa.me/${normalizedPhone}`} target="_blank" rel="noreferrer" className="btn-secondary px-3 py-2 text-xs">WhatsApp Customer</a>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Delivery Details</p>
            <div className="mt-3 space-y-2 text-sm">
              <p><span className="text-muted">Area:</span> {order.area || '-'}</p>
              <p><span className="text-muted">Address:</span> {order.address || '-'}</p>
              <p><span className="text-muted">Notes:</span> {order.notes || '-'}</p>
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Order Summary</p>
            <div className="mt-3 space-y-2">
              {(items ?? []).map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <p>{item.item_name} × {item.quantity}</p>
                  <p>{formatCurrency(Number(item.total_price))}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-muted">
              <p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(Number(order.subtotal))}</span></p>
              <p className="flex justify-between"><span>Delivery Fee</span><span>{formatCurrency(Number(order.delivery_fee))}</span></p>
              <p className="flex justify-between text-lg font-semibold text-primary"><span>Total</span><span>{formatCurrency(Number(order.total))}</span></p>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-medium">Action Center</p>
                <p className="mt-1 text-xs text-muted">Quick progression controls and manual overrides.</p>
              </div>
              {canPrintReceipt ? (
                <Link href={`/admin/orders/${order.id}/print`} target="_blank" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted hover:border-primary/45 hover:text-primary" aria-label="Print receipt">
                  <Printer className="h-4 w-4" />
                </Link>
              ) : (
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted/40" title="Waiting for payment confirmation">
                  <Printer className="h-4 w-4" />
                </span>
              )}
            </div>

            <OrderQuickActions orderId={order.id} orderStatus={order.order_status} paymentStatus={order.payment_status} />

            <form action={updateOrderStatuses} className="mt-4 grid gap-3 border-t border-border pt-4 md:grid-cols-2">
              <input type="hidden" name="orderId" value={order.id} />
              <div>
                <label className="text-sm text-muted">Payment Status</label>
                <select name="paymentStatus" className="input mt-1" defaultValue={order.payment_status}>
                  <option value="not_required">not_required</option>
                  <option value="pending">pending</option>
                  <option value="confirmed">confirmed</option>
                  <option value="failed">failed</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-muted">Order Status</label>
                <select name="orderStatus" className="input mt-1" defaultValue={order.order_status}>
                  <option value="new">new</option>
                  <option value="confirmed">confirmed</option>
                  <option value="preparing">preparing</option>
                  <option value="out_for_delivery">out_for_delivery</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
              <button className="btn-primary md:col-span-2">Save Updates</button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
