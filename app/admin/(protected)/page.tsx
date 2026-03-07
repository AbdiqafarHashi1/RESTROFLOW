import Link from 'next/link';
import { StatsCard } from '@/components/admin/stats-card';
import { createServerClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/formatters';

export default async function AdminDashboardPage() {
  const supabase = createServerClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [{ count: ordersToday }, { data: ordersTodayRows }, { count: newOrders }, { count: activeItems }, { count: pendingPayments }, { data: recentOrders }] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', startOfDay.toISOString()),
    supabase.from('orders').select('total').gte('created_at', startOfDay.toISOString()),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'new'),
    supabase.from('menu_items').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'pending'),
    supabase.from('orders').select('id,order_number,customer_name,total,order_status,created_at').order('created_at', { ascending: false }).limit(8),
  ]);

  const revenueToday = (ordersTodayRows?.reduce((sum, row) => sum + Number(row.total ?? 0), 0) ?? 0);

  return (
    <div>
      <h1 className="section-title">Dashboard</h1>
      <div className="mt-6 grid gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatsCard title="Total orders today" value={String(ordersToday ?? 0)} />
        <StatsCard title="Revenue today" value={formatCurrency(revenueToday)} />
        <StatsCard title="New orders" value={String(newOrders ?? 0)} />
        <StatsCard title="Active menu items" value={String(activeItems ?? 0)} />
        <StatsCard title="Pending payments" value={String(pendingPayments ?? 0)} />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4">
        <p className="font-medium">Recent Orders</p>
        <div className="mt-3 space-y-2 text-sm">
          {(recentOrders ?? []).map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between rounded-lg border border-border p-3">
              <span>{order.order_number} · {order.customer_name}</span>
              <span className="text-muted">{formatCurrency(Number(order.total))}</span>
            </Link>
          ))}
          {!recentOrders?.length && <p className="text-muted">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}
