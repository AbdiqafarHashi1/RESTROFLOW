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

type SectionTone = 'payment' | 'active' | 'muted';

function sectionToneClasses(tone: SectionTone) {
  if (tone === 'payment') return 'border-amber-400/35 bg-amber-500/10';
  if (tone === 'active') return 'border-sky-400/35 bg-sky-500/10';
  return 'border-border bg-surface/60';
}

function OrdersSection({
  title,
  description,
  orders,
  tone,
  sectionId,
}: {
  title: string;
  description: string;
  orders: OrderRow[];
  tone: SectionTone;
  sectionId: string;
}) {
  return (
    <section id={sectionId} className={`scroll-mt-28 rounded-2xl border p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)] md:p-5 ${sectionToneClasses(tone)}`}>
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="text-xs text-muted">{description}</p>
      </div>

      {orders.length ? (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
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

function isPaymentFirst(order: OrderRow) {
  return order.payment_method === 'send_money' || (order.order_type === 'pickup' && order.payment_method === 'pay_on_pickup');
}

function isUrgentPriorityOrder(order: OrderRow) {
  return (
    (order.order_status === 'new' && order.payment_status === 'pending') ||
    (order.payment_method === 'send_money' && order.payment_status === 'pending' && order.customer_marked_paid)
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

  const paymentPendingOrFirstOrders = orders
    .filter(
      (order) =>
        (order.payment_status === 'pending' && order.payment_method === 'send_money') ||
        (order.payment_status === 'pending' && order.customer_marked_paid) ||
        isPaymentFirst(order),
    )
    .slice(0, 18);
  const priorityOrders = orders.filter(isUrgentPriorityOrder).slice(0, 18);
  const otherActiveOrders = orders
    .filter((order) => ['preparing', 'out_for_delivery', 'new', 'confirmed'].includes(order.order_status))
    .slice(0, 18);

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-6">
      <div className="space-y-1">
        <h1 className="section-title">Operations Control Center</h1>
        <p className="text-sm text-muted">Operational dashboard aligned with the Orders board layout for faster scanning across mobile and desktop.</p>
      </div>

      <section className="sticky top-2 z-20 -mx-1 rounded-2xl border border-primary/35 bg-background/95 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
          <a href="#queue-payment-first" className="rounded-lg border border-amber-300/35 bg-amber-500/10 px-2 py-2 text-center">
            <p className="text-[10px] uppercase tracking-[0.12em] text-amber-200">Payment-first</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{paymentPendingOrFirstOrders.length}</p>
          </a>
          <a href="#queue-payment-first" className="rounded-lg border border-violet-300/35 bg-violet-500/10 px-2 py-2 text-center">
            <p className="text-[10px] uppercase tracking-[0.12em] text-violet-200">Cash on delivery</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{orders.filter((order) => order.payment_method === 'cash_on_delivery').length}</p>
          </a>
          <a href="#queue-other-active" className="rounded-lg border border-sky-300/35 bg-sky-500/10 px-2 py-2 text-center">
            <p className="text-[10px] uppercase tracking-[0.12em] text-sky-200">Preparing / out</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{(preparingOrders ?? 0) + (outForDelivery ?? 0)}</p>
          </a>
          <a href="#queue-other-active" className="rounded-lg border border-emerald-300/35 bg-emerald-500/10 px-2 py-2 text-center">
            <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-200">Delivered today</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{deliveredToday ?? 0}</p>
          </a>
          <a href="#queue-other-active" className="col-span-2 rounded-lg border border-primary/45 bg-primary/15 px-2 py-2 text-center lg:col-span-4">
            <p className="text-[10px] uppercase tracking-[0.12em] text-primary">Today revenue</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{formatCurrency(revenueToday)}</p>
          </a>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Orders Today" value={String(ordersToday ?? 0)} accent />
        <StatsCard title="Pending Payments" value={String(pendingPayments ?? 0)} />
        <StatsCard title="Preparing Orders" value={String(preparingOrders ?? 0)} />
        <StatsCard title="Out for Delivery" value={String(outForDelivery ?? 0)} />
      </div>

      <OrdersSection
        title="Payment Pending / Payment-first orders"
        description="Send money and payment-first orders that require payment handling before fulfillment proceeds."
        orders={paymentPendingOrFirstOrders}
        tone="payment"
        sectionId="queue-payment-first"
      />

      <OrdersSection
        title="Urgent / Priority Orders"
        description="New unpaid orders and urgent payment-check requests that need immediate staff action."
        orders={priorityOrders}
        tone="payment"
        sectionId="queue-priority"
      />

      <OrdersSection
        title="Other active orders"
        description="Orders currently in active fulfilment or recently created states for day-to-day dispatch visibility."
        orders={otherActiveOrders}
        tone="active"
        sectionId="queue-other-active"
      />
    </div>
  );
}
