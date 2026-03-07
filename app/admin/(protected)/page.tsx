import Link from 'next/link';
import { StatsCard } from '@/components/admin/stats-card';
import { OrderStatusBadge } from '@/components/admin/order-status-badge';
import { PaymentStatusBadge } from '@/components/admin/payment-status-badge';
import { OrderQuickActions } from '@/components/admin/order-quick-actions';
import { createServerClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime, formatTimeAgo } from '@/lib/formatters';
import type { OrderStatus, PaymentMethod, PaymentStatus, OrderType } from '@/types';

type OrderRow = {
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
};

function OperationalOrderTable({ title, description, orders }: { title: string; description: string; orders: OrderRow[] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-[980px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr>
              <th className="px-2 py-2">Order #</th>
              <th className="px-2 py-2">Customer</th>
              <th className="px-2 py-2">Type</th>
              <th className="px-2 py-2">Payment</th>
              <th className="px-2 py-2">Statuses</th>
              <th className="px-2 py-2">Total</th>
              <th className="px-2 py-2">Age</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-border align-top">
                <td className="px-2 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-medium hover:text-primary">
                    {order.order_number}
                  </Link>
                </td>
                <td className="px-2 py-3">
                  <p>{order.customer_name}</p>
                  <p className="text-xs text-muted">{order.customer_phone}</p>
                </td>
                <td className="px-2 py-3 text-muted">{order.order_type}</td>
                <td className="px-2 py-3 text-muted">{order.payment_method}</td>
                <td className="px-2 py-3">
                  <div className="flex flex-wrap gap-2">
                    <OrderStatusBadge status={order.order_status} />
                    <PaymentStatusBadge status={order.payment_status} />
                  </div>
                </td>
                <td className="px-2 py-3">{formatCurrency(Number(order.total))}</td>
                <td className="px-2 py-3">
                  <p>{formatTimeAgo(order.created_at)}</p>
                  <p className="text-xs text-muted">{formatDateTime(order.created_at)}</p>
                </td>
                <td className="px-2 py-3">
                  <OrderQuickActions orderId={order.id} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!orders.length && <p className="mt-3 text-sm text-muted">No orders in this queue.</p>}
    </section>
  );
}

export default async function AdminDashboardPage() {
  const supabase = createServerClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [{ count: ordersToday }, { data: ordersTodayRows }, { count: pendingPayments }, { count: newOrders }, { count: activeItems }, { data: latestOrders }] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', startOfDay.toISOString()),
    supabase.from('orders').select('total').gte('created_at', startOfDay.toISOString()),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'pending'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'new'),
    supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase
      .from('orders')
      .select('id,order_number,customer_name,customer_phone,order_type,payment_method,payment_status,order_status,total,created_at')
      .order('created_at', { ascending: false })
      .limit(80),
  ]);

  const revenueToday = (ordersTodayRows?.reduce((sum, row) => sum + Number(row.total ?? 0), 0) ?? 0);
  const orders = (latestOrders ?? []) as OrderRow[];

  const pendingPaymentOrders = orders.filter((order) => order.payment_status === 'pending' && order.order_status !== 'cancelled').slice(0, 12);
  const newlyPlacedOrders = orders.filter((order) => order.order_status === 'new').slice(0, 12);
  const activeOrders = orders.filter((order) => ['confirmed', 'preparing', 'out_for_delivery'].includes(order.order_status)).slice(0, 12);
  const recentCompletedOrders = orders.filter((order) => order.order_status === 'delivered').slice(0, 8);

  return (
    <div className="space-y-6">
      <h1 className="section-title">Dashboard</h1>

      <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatsCard title="Orders today" value={String(ordersToday ?? 0)} />
        <StatsCard title="Revenue today" value={formatCurrency(revenueToday)} />
        <StatsCard title="Pending payments" value={String(pendingPayments ?? 0)} />
        <StatsCard title="New orders" value={String(newOrders ?? 0)} />
        <StatsCard title="Active menu items" value={String(activeItems ?? 0)} />
      </div>

      <OperationalOrderTable
        title="Pending Payment Orders"
        description="Highest urgency: verify transfers and confirm payment quickly."
        orders={pendingPaymentOrders}
      />

      <OperationalOrderTable
        title="New Orders"
        description="Confirm these orders first so kitchen and dispatch can start."
        orders={newlyPlacedOrders}
      />

      <OperationalOrderTable
        title="Active Orders"
        description="Track orders currently in prep or delivery."
        orders={activeOrders}
      />

      <OperationalOrderTable
        title="Recent Completed Orders"
        description="Recently delivered orders for quick follow-up and review."
        orders={recentCompletedOrders}
      />
    </div>
  );
}
