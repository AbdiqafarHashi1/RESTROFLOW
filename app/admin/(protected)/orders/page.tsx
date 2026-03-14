import { createServerClient } from '@/lib/supabase/server';
import { OrderCard } from '@/components/admin/order-card';
import type { OrderStatus, OrderType, PaymentMethod, PaymentStatus } from '@/types';

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

type SectionTone = 'payment' | 'cash' | 'active' | 'success' | 'muted';

function getTodayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function isValidIsoDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function addDays(dateIso: string, days: number) {
  const date = new Date(`${dateIso}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function sectionToneClasses(tone: SectionTone) {
  if (tone === 'payment') return 'border-amber-400/35 bg-amber-500/10';
  if (tone === 'cash') return 'border-violet-400/35 bg-violet-500/10';
  if (tone === 'active') return 'border-sky-400/35 bg-sky-500/10';
  if (tone === 'success') return 'border-emerald-400/35 bg-emerald-500/10';
  return 'border-border bg-surface/60';
}

function OrdersSection({
  title,
  description,
  orders,
  tone,
  defaultOpen,
  showActions,
  sectionId,
}: {
  title: string;
  description: string;
  orders: OrderRow[];
  tone: SectionTone;
  defaultOpen?: boolean;
  showActions?: boolean;
  sectionId: string;
}) {
  return (
    <details id={sectionId} open={defaultOpen} className={`scroll-mt-28 rounded-2xl border p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)] md:p-5 ${sectionToneClasses(tone)}`}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold md:text-lg">{title}</h2>
          <p className="mt-1 text-xs text-muted">{description}</p>
        </div>
        <span className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-xs text-white/90">{orders.length}</span>
      </summary>

      <div className="mt-4 border-t border-white/10 pt-4">
        {orders.length ? (
          <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} showActions={showActions} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No orders in this section.</p>
        )}
      </div>
    </details>
  );
}

function isActiveFulfillment(order: OrderRow) {
  return order.order_status === 'preparing' || order.order_status === 'out_for_delivery';
}

function isPaymentFirst(order: OrderRow) {
  return order.payment_method === 'send_money' || (order.order_type === 'pickup' && order.payment_method === 'pay_on_pickup');
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: { date?: string };
}) {
  const todayIso = getTodayIsoDate();
  const rawDate = searchParams?.date ?? todayIso;
  const selectedDate = isValidIsoDate(rawDate) ? rawDate : todayIso;
  const nextDate = addDays(selectedDate, 1);
  const isTodayView = selectedDate === todayIso;

  const supabase = createServerClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id,order_number,customer_name,customer_phone,order_type,payment_method,payment_status,order_status,total,created_at,area,address,customer_marked_paid')
    .gte('created_at', `${selectedDate}T00:00:00.000Z`)
    .lt('created_at', `${nextDate}T00:00:00.000Z`)
    .order('created_at', { ascending: false })
    .limit(200);

  const orderRows = (orders ?? []) as OrderRow[];
  const paymentFirstOrders: OrderRow[] = [];
  const codOrders: OrderRow[] = [];
  const activeFulfillmentOrders: OrderRow[] = [];
  const deliveredRecentOrders: OrderRow[] = [];
  const otherNonActiveOrders: OrderRow[] = [];

  let deliveredCount = 0;
  let cancelledCount = 0;
  let pendingOrReviewCount = 0;
  let deliveredRevenueTotal = 0;

  orderRows.forEach((order) => {
    if (order.order_status === 'delivered') {
      deliveredCount += 1;
      deliveredRevenueTotal += Number(order.total || 0);
    }

    if (order.order_status === 'cancelled') {
      cancelledCount += 1;
    }

    if (order.payment_status === 'pending') {
      pendingOrReviewCount += 1;
    }

    if (isActiveFulfillment(order)) {
      activeFulfillmentOrders.push(order);
      return;
    }

    if (order.order_status === 'delivered') {
      if (deliveredRecentOrders.length < 20) {
        deliveredRecentOrders.push(order);
      }
      return;
    }

    if (order.payment_method === 'cash_on_delivery') {
      codOrders.push(order);
      return;
    }

    if (isPaymentFirst(order)) {
      paymentFirstOrders.push(order);
      return;
    }

    otherNonActiveOrders.push(order);
  });

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-5">
      <div>
        <h1 className="section-title">Orders</h1>
        <p className="mt-1 text-sm text-muted">Daily operational board with date history. Live queue defaults to today while older data stays retrievable.</p>
      </div>

      {isTodayView ? (
        <section className="sticky top-2 z-20 -mx-1 rounded-2xl border border-primary/35 bg-background/95 p-2 shadow-[0_10px_30px_rgba(0,0,0,0.35)] backdrop-blur">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
            <a href="#queue-payment-first" className="rounded-lg border border-amber-300/35 bg-amber-500/10 px-2 py-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.12em] text-amber-200">Payment-first</p>
              <p className="mt-0.5 text-sm font-semibold text-white">{paymentFirstOrders.length}</p>
            </a>
            <a href="#queue-cod" className="rounded-lg border border-violet-300/35 bg-violet-500/10 px-2 py-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.12em] text-violet-200">Cash on delivery</p>
              <p className="mt-0.5 text-sm font-semibold text-white">{codOrders.length}</p>
            </a>
            <a href="#queue-active" className="rounded-lg border border-sky-300/35 bg-sky-500/10 px-2 py-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.12em] text-sky-200">Preparing / out</p>
              <p className="mt-0.5 text-sm font-semibold text-white">{activeFulfillmentOrders.length}</p>
            </a>
            <a href="#queue-delivered" className="rounded-lg border border-emerald-300/35 bg-emerald-500/10 px-2 py-2 text-center">
              <p className="text-[10px] uppercase tracking-[0.12em] text-emerald-200">Delivered today</p>
              <p className="mt-0.5 text-sm font-semibold text-white">{deliveredCount}</p>
            </a>
            <a href="#queue-delivered" className="col-span-2 rounded-lg border border-primary/45 bg-primary/15 px-2 py-2 text-center sm:col-span-1">
              <p className="text-[10px] uppercase tracking-[0.12em] text-primary">Today revenue</p>
              <p className="mt-0.5 text-sm font-semibold text-white">KES {deliveredRevenueTotal.toLocaleString()}</p>
            </a>
          </div>
        </section>
      ) : null}

      <section className="space-y-3 rounded-2xl border border-border bg-card/80 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-2">
          <a href="/admin/orders" className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] ${isTodayView ? 'border-primary/60 bg-primary/15 text-primary' : 'border-border text-muted hover:border-primary/40 hover:text-primary'}`}>Today</a>
          <a href={`/admin/orders?date=${addDays(todayIso, -1)}`} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:border-primary/40 hover:text-primary">Yesterday</a>
          <a href={`/admin/orders?date=${addDays(todayIso, -2)}`} className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-muted hover:border-primary/40 hover:text-primary">2 days ago</a>
        </div>

        <form action="/admin/orders" method="get" className="flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-xs text-muted">
            Select date
            <input type="date" name="date" defaultValue={selectedDate} max={todayIso} className="rounded-lg border border-border bg-surface px-2.5 py-2 text-sm text-white" />
          </label>
          <button type="submit" className="btn-secondary px-4 py-2 text-sm">Load date</button>
        </form>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <div className="rounded-xl border border-border/80 bg-surface/80 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Date</p>
            <p className="mt-1 text-sm font-semibold">{selectedDate}</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-surface/80 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Total orders</p>
            <p className="mt-1 text-sm font-semibold">{orderRows.length}</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-surface/80 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Delivered</p>
            <p className="mt-1 text-sm font-semibold">{deliveredCount}</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-surface/80 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Cancelled</p>
            <p className="mt-1 text-sm font-semibold">{cancelledCount}</p>
          </div>
          <div className="rounded-xl border border-border/80 bg-surface/80 p-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-muted">Pending / review</p>
            <p className="mt-1 text-sm font-semibold">{pendingOrReviewCount}</p>
          </div>
          <div className="col-span-2 rounded-xl border border-primary/30 bg-primary/10 p-3 sm:col-span-3 lg:col-span-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-primary">Revenue (delivered orders)</p>
            <p className="mt-1 text-base font-semibold text-white">KES {deliveredRevenueTotal.toLocaleString()}</p>
          </div>
        </div>

        {!isTodayView ? (
          <p className="rounded-xl border border-amber-300/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">History mode: showing {selectedDate}. Older delivered/completed orders stay out of today&apos;s live board by default.</p>
        ) : null}
      </section>

      <div className="space-y-4">
        <OrdersSection
          title="Payment-first orders"
          description="Send money orders and pickup orders that require payment handling before fulfillment."
          orders={paymentFirstOrders}
          tone="payment"
          defaultOpen
          showActions={isTodayView}
          sectionId="queue-payment-first"
        />

        <OrdersSection
          title="Cash on delivery"
          description="Direct cash-on-delivery orders awaiting confirmation, preparation, or dispatch."
          orders={codOrders}
          tone="cash"
          defaultOpen
          showActions={isTodayView}
          sectionId="queue-cod"
        />

        <OrdersSection
          title="Preparing / Out for delivery"
          description="Active fulfillment queue currently in preparation or in transit."
          orders={activeFulfillmentOrders}
          tone="active"
          defaultOpen
          showActions={isTodayView}
          sectionId="queue-active"
        />

        <OrdersSection
          title="Delivered recently"
          description="Recently completed deliveries for short-term operational review (latest 20)."
          orders={deliveredRecentOrders}
          tone="success"
          showActions={isTodayView}
          sectionId="queue-delivered"
        />

        <OrdersSection
          title="Cancelled / other non-active"
          description="Cancelled and other non-active orders that are not in the current live queues."
          orders={otherNonActiveOrders}
          tone="muted"
          showActions={isTodayView}
          sectionId="queue-non-active"
        />
      </div>
    </div>
  );
}
