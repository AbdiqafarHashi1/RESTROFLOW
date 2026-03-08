import { StatsCard } from '@/components/admin/stats-card';
import { OrderCard } from '@/components/admin/order-card';
import { createServerClient } from '@/lib/supabase/server';
import { formatCurrency } from '@/lib/formatters';
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
  area?: string | null;
  address?: string | null;
};

function OrdersSection({ title, description, orders }: { title: string; description: string; orders: OrderRow[] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface/60 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)] md:p-5">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-xs text-muted">{description}</p>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>

      {!orders.length && <p className="text-sm text-muted">No orders in this queue.</p>}
    </section>
  );
}

export default async function AdminDashboardPage() {
  const supabase = createServerClient();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    { count: ordersToday },
    { data: ordersTodayRows },
    { count: pendingPayments },
    { count: preparingOrders },
    { count: outForDelivery },
    { count: deliveredToday },
    { data: latestOrders },
  ] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', startOfDay.toISOString()),
    supabase.from('orders').select('total').gte('created_at', startOfDay.toISOString()),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('payment_status', 'pending'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'preparing'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'out_for_delivery'),
    supabase.from('orders').select('id', { count: 'exact', head: true }).eq('order_status', 'delivered').gte('created_at', startOfDay.toISOString()),
    supabase
      .from('orders')
      .select('id,order_number,customer_name,customer_phone,order_type,payment_method,payment_status,order_status,total,created_at,area,address')
      .order('created_at', { ascending: false })
      .limit(80),
  ]);

  const revenueToday = (ordersTodayRows?.reduce((sum, row) => sum + Number(row.total ?? 0), 0) ?? 0);
  const orders = (latestOrders ?? []) as OrderRow[];

  const pendingPaymentOrders = orders.filter((order) => order.payment_status === 'pending' && order.order_status !== 'cancelled').slice(0, 10);
  const activeOrders = orders.filter((order) => ['new', 'confirmed', 'preparing', 'out_for_delivery'].includes(order.order_status)).slice(0, 12);
  const recentCompletedOrders = orders.filter((order) => order.order_status === 'delivered').slice(0, 8);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="section-title">Operations Control Center</h1>
        <p className="text-sm text-muted">Live order monitoring and service execution for Beirut Express.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatsCard title="Orders Today" value={String(ordersToday ?? 0)} accent />
        <StatsCard title="Revenue Today" value={formatCurrency(revenueToday)} />
        <StatsCard title="Pending Payments" value={String(pendingPayments ?? 0)} />
        <StatsCard title="Preparing Orders" value={String(preparingOrders ?? 0)} />
        <StatsCard title="Out for Delivery" value={String(outForDelivery ?? 0)} />
        <StatsCard title="Delivered Today" value={String(deliveredToday ?? 0)} />
      </div>

      <OrdersSection
        title="Priority Queue"
        description="Unpaid or newly placed orders that require immediate staff attention."
        orders={pendingPaymentOrders}
      />

      <OrdersSection
        title="Active Service Flow"
        description="Orders currently being confirmed, prepared, or dispatched."
        orders={activeOrders}
      />

      <OrdersSection
        title="Delivered Recently"
        description="Completed orders for quick review and customer follow-up."
        orders={recentCompletedOrders}
      />
    </div>
  );
}
