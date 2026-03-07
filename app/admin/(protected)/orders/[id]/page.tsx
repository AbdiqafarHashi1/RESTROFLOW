import { notFound } from 'next/navigation';
import { OrderStatusBadge } from '@/components/admin/order-status-badge';
import { PaymentStatusBadge } from '@/components/admin/payment-status-badge';
import { createServerClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/formatters';
import { updateOrderStatuses } from '@/actions/admin';

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

  return (
    <div className="space-y-4">
      <h1 className="section-title">Order {order.order_number}</h1>
      <div className="rounded-xl border border-border bg-card p-4 text-sm">
        <div className="flex flex-wrap items-center gap-2">
          <OrderStatusBadge status={order.order_status} />
          <PaymentStatusBadge status={order.payment_status} />
          {order.customer_marked_paid && <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs text-blue-300">customer marked paid</span>}
        </div>
        <p className="mt-3">Customer: {order.customer_name}</p>
        <p>Phone: {order.customer_phone}</p>
        <p>Order type: {order.order_type}</p>
        <p>Payment method: {order.payment_method}</p>
        <p>Area: {order.area || '-'}</p>
        <p>Address: {order.address || '-'}</p>
        <p>Notes: {order.notes || '-'}</p>
        <p>Created: {new Date(order.created_at).toLocaleString()}</p>
        <div className="mt-3 flex gap-3">
          <a href={`tel:${order.customer_phone}`} className="btn-secondary">Call Customer</a>
          <a href={`https://wa.me/${order.customer_phone.replace('+', '')}`} target="_blank" className="btn-secondary">WhatsApp Customer</a>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="font-medium">Items</p>
        <div className="mt-3 space-y-2 text-sm">
          {(items ?? []).map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.item_name} × {item.quantity}</span>
              <span>{formatCurrency(Number(item.total_price))}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm text-muted">
          <p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(Number(order.subtotal))}</span></p>
          <p className="flex justify-between"><span>Delivery Fee</span><span>{formatCurrency(Number(order.delivery_fee))}</span></p>
          <p className="flex justify-between text-white"><span>Total</span><span>{formatCurrency(Number(order.total))}</span></p>
        </div>
      </div>

      <form action={updateOrderStatuses} className="rounded-xl border border-border bg-card p-4">
        <p className="font-medium">Admin Actions</p>
        <input type="hidden" name="orderId" value={order.id} />
        <div className="mt-3 grid gap-3 md:grid-cols-2">
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
        <button className="btn-primary mt-3">Save Updates</button>
      </form>
    </div>
  );
}
