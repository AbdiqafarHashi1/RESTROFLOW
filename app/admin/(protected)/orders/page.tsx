import Link from 'next/link';
import { OrderStatusBadge } from '@/components/admin/order-status-badge';

const orders = [
  { id: 'o1', order_number: 'BEX-000123', customer_name: 'Amina', customer_phone: '+254700111222', order_type: 'delivery', total: 750, status: 'new', created_at: '2026-01-20T10:00:00Z' },
  { id: 'o2', order_number: 'BEX-000124', customer_name: 'Brian', customer_phone: '+254700111223', order_type: 'pickup', total: 500, status: 'preparing', created_at: '2026-01-20T10:05:00Z' },
] as const;

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="section-title">Orders</h1>
      <div className="mt-5 space-y-3">
        {orders.map((order) => (
          <Link key={order.id} href={`/admin/orders/${order.id}`} className="block rounded-xl border border-border bg-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{order.order_number} · {order.customer_name}</p>
                <p className="text-sm text-muted">{order.customer_phone} · {order.order_type} · KES {order.total}</p>
              </div>
              <OrderStatusBadge status={order.status} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
