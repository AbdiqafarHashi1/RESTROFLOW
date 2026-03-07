import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { OrderStatusBadge } from '@/components/admin/order-status-badge';
import { PaymentStatusBadge } from '@/components/admin/payment-status-badge';
import { updateOrderStatuses } from '@/actions/admin';
import { formatCurrency } from '@/lib/formatters';

export default async function AdminOrdersPage() {
  const supabase = createServerClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id,order_number,customer_name,customer_phone,order_type,payment_method,payment_status,order_status,total,created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div>
      <h1 className="section-title">Orders</h1>
      <div className="mt-5 space-y-3">
        {(orders ?? []).map((order) => (
          <div key={order.id} className="rounded-xl border border-border bg-card p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <Link href={`/admin/orders/${order.id}`} className="block">
                <p className="font-medium">{order.order_number} · {order.customer_name}</p>
                <p className="text-sm text-muted">{order.customer_phone} · {order.order_type} · {order.payment_method}</p>
                <p className="text-sm text-muted">{formatCurrency(Number(order.total))} · {new Date(order.created_at).toLocaleString()}</p>
              </Link>

              <div className="flex items-center gap-2">
                <OrderStatusBadge status={order.order_status} />
                <PaymentStatusBadge status={order.payment_status} />
              </div>
            </div>

            <form action={updateOrderStatuses} className="mt-3 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <input type="hidden" name="orderId" value={order.id} />
              <select name="orderStatus" className="input" defaultValue={order.order_status}>
                <option value="new">new</option>
                <option value="confirmed">confirmed</option>
                <option value="preparing">preparing</option>
                <option value="out_for_delivery">out_for_delivery</option>
                <option value="delivered">delivered</option>
                <option value="cancelled">cancelled</option>
              </select>
              <select name="paymentStatus" className="input" defaultValue={order.payment_status}>
                <option value="not_required">not_required</option>
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="failed">failed</option>
              </select>
              <button className="btn-secondary">Update</button>
            </form>
          </div>
        ))}
        {!orders?.length && <p className="text-muted">No orders found.</p>}
      </div>
    </div>
  );
}
