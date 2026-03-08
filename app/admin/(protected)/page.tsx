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
  customer_marked_paid?: boolean;
};

function OrdersSection({ title, description, orders }: { title: string; description: string; orders: OrderRow[] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface/60 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)] md:p-5">
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-xs text-muted">{description}</p>
      </div>

      {orders.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No orders in this queue.</p>
      )}
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
      .select('id,order_number,customer_name,customer_phone,order_type,payment_method,payment_status,order_status,total,created_at,area,address,customer_marked_paid')
      .order('created_at', { ascending: false })
      .limit(120),
  ]);

  const revenueToday = ordersTodayRows?.reduce((sum, row) => sum + Number(row.total ?? 0), 0) ?? 0;
  const orders = (latestOrders ?? []) as OrderRow[];

  const paymentReviewOrders = orders.filter(
    (order) => order.payment_method === 'send_money' && order.payment_status === 'pending' && order.customer_marked_paid,
  );
  const priorityOrders = orders.filter(
    (order) =>
      (order.order_status === 'new' && order.payment_status === 'pending') ||
      (order.payment_method === 'send_money' && order.payment_status === 'pending' && order.customer_marked_paid),
  );
  const sendMoneyOrders = orders.filter((order) => order.payment_method === 'send_money').slice(0, 16);
  const codOrders = orders.filter((order) => order.payment_method === 'cash_on_delivery').slice(0, 16);
  const pickupOrders = orders.filter((order) => order.order_type === 'pickup').slice(0, 16);
  const activeOrders = orders.filter((order) => ['preparing', 'out_for_delivery'].includes(order.order_status)).slice(0, 16);
  const recentCompletedOrders = orders.filter((order) => order.order_status === 'delivered').slice(0, 12);

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-6">
      <div className="space-y-1">
        <h1 className="section-title">Operations Control Center</h1>
        <p className="text-sm text-muted">Compact multi-column order board built from the mobile card pattern for faster desktop operations.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        <StatsCard title="Orders Today" value={String(ordersToday ?? 0)} accent />
        <StatsCard title="Revenue Today" value={formatCurrency(revenueToday)} />
        <StatsCard title="Pending Payments" value={String(pendingPayments ?? 0)} />
        <StatsCard title="Awaiting Payment Review" value={String(paymentReviewOrders.length)} />
        <StatsCard title="Preparing Orders" value={String(preparingOrders ?? 0)} />
        <StatsCard title="Out for Delivery" value={String(outForDelivery ?? 0)} />
        <StatsCard title="Delivered Today" value={String(deliveredToday ?? 0)} />
      </div>

      <OrdersSection
        title="Payment Review Needed"
        description={'Send money orders where customers clicked "I Have Paid" and are waiting for verification.'}
        orders={paymentReviewOrders}
      />

      <OrdersSection
        title="Urgent / Priority Orders"
        description="New unpaid orders and urgent payment-check requests that need immediate staff action."
        orders={priorityOrders}
      />

      <OrdersSection title="Send Money Orders" description="Transfer-based flow separated for clear payment verification and confirmation." orders={sendMoneyOrders} />

      <OrdersSection title="Cash on Delivery Orders" description="COD queue separated for dispatch and handoff operations." orders={codOrders} />

      <OrdersSection title="Pickup Orders" description="Pickup flow grouped for counter preparation and completion." orders={pickupOrders} />

      <OrdersSection title="Preparing / Out for Delivery" description="Live active fulfilment states currently in progress." orders={activeOrders} />

      <OrdersSection title="Delivered Recently" description="Completed orders kept visible for short-term operational review." orders={recentCompletedOrders} />
    </div>
  );
}
