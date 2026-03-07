import Link from 'next/link';
import { notFound } from 'next/navigation';
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
        <h1 className="section-title">Order {order.order_number}</h1>
        {canPrintReceipt ? (
          <Link href={`/admin/orders/${order.id}/print`} className="btn-secondary" target="_blank">Print Receipt</Link>
        ) : (
          <div className="text-right">
            <button type="button" className="btn-secondary cursor-not-allowed opacity-50" disabled>Print Receipt</button>
            <p className="mt-1 text-xs text-muted">Waiting for payment confirmation.</p>
          </div>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.25fr_.9fr]">
        <section className="rounded-xl border border-border bg-card p-4 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.order_status} />
            <PaymentStatusBadge status={order.payment_status} />
            {order.customer_marked_paid && <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">customer marked paid</span>}
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted">Customer</p>
              <p className="font-medium">{order.customer_name}</p>
              <p>{order.customer_phone}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`tel:${order.customer_phone}`} className="btn-secondary px-3 py-2 text-xs">Call Customer</a>
                <a href={`https://wa.me/${normalizedPhone}`} target="_blank" rel="noreferrer" className="btn-secondary px-3 py-2 text-xs">WhatsApp Customer</a>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-muted">Order Info</p>
              <p>Type: <span className="text-muted">{order.order_type}</span></p>
              <p>Payment: <span className="text-muted">{order.payment_method}</span></p>
              <p>Created: <span className="text-muted">{formatDateTime(order.created_at)}</span></p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border p-3">
            <p className="text-xs uppercase tracking-wide text-muted">Delivery Details</p>
            <p className="mt-1">Area: {order.area || '-'}</p>
            <p>Address: {order.address || '-'}</p>
            <p>Notes: {order.notes || '-'}</p>
          </div>

          <div className="mt-4 rounded-lg border border-border p-3">
            <p className="font-medium">Items</p>
            <div className="mt-2 space-y-2">
              {(items ?? []).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <p>{item.item_name} × {item.quantity}</p>
                  <p>{formatCurrency(Number(item.total_price))}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1 border-t border-border pt-3 text-muted">
              <p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(Number(order.subtotal))}</span></p>
              <p className="flex justify-between"><span>Delivery Fee</span><span>{formatCurrency(Number(order.delivery_fee))}</span></p>
              <p className="flex justify-between text-base text-white"><span>Total</span><span>{formatCurrency(Number(order.total))}</span></p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="font-medium">Quick Actions</p>
            <p className="mt-1 text-xs text-muted">One-tap updates for active service flow.</p>
            <OrderQuickActions orderId={order.id} />
          </div>

          <form action={updateOrderStatuses} className="rounded-xl border border-border bg-card p-4">
            <p className="font-medium">Manual Status Controls</p>
            <input type="hidden" name="orderId" value={order.id} />
            <div className="mt-3 grid gap-3">
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
            </div>
            <button className="btn-primary mt-3 w-full">Save Updates</button>
          </form>
        </section>
      </div>
    </div>
  );
}
