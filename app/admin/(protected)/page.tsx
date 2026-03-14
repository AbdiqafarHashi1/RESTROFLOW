import Link from 'next/link';
import { StatsCard } from '@/components/admin/stats-card';
import { PrintReportButton } from '@/components/admin/print-report-button';
import { createServerClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
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

type SearchParams = Record<string, string | string[] | undefined>;

type DateRange = {
  label: string;
  key: 'today' | 'yesterday' | 'this_week' | 'this_month' | 'custom';
  start: Date;
  end: Date;
  selectedDate?: string;
};

function startOfDay(date: Date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function parseDateInput(value: string | undefined) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatRangeLabel(date: Date) {
  return new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium' }).format(date);
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-KE', { timeStyle: 'short' }).format(new Date(value));
}

function resolveDateRange(searchParams: SearchParams): DateRange {
  const preset = typeof searchParams.preset === 'string' ? searchParams.preset : 'today';
  const now = new Date();
  const todayStart = startOfDay(now);

  if (preset === 'yesterday') {
    const start = addDays(todayStart, -1);
    return { key: 'yesterday', label: 'Yesterday', start, end: todayStart };
  }

  if (preset === 'this_week') {
    const weekStart = startOfDay(now);
    const day = weekStart.getDay();
    const shift = day === 0 ? -6 : 1 - day;
    weekStart.setDate(weekStart.getDate() + shift);
    return { key: 'this_week', label: 'This week', start: weekStart, end: now };
  }

  if (preset === 'this_month') {
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return { key: 'this_month', label: 'This month', start: monthStart, end: now };
  }

  const customDate = parseDateInput(typeof searchParams.date === 'string' ? searchParams.date : undefined);
  if (customDate) {
    return {
      key: 'custom',
      label: `Date: ${formatRangeLabel(customDate)}`,
      start: customDate,
      end: addDays(customDate, 1),
      selectedDate: customDate.toISOString().slice(0, 10),
    };
  }

  return {
    key: 'today',
    label: 'Today',
    start: todayStart,
    end: now,
    selectedDate: todayStart.toISOString().slice(0, 10),
  };
}

export default async function AdminDashboardPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const range = resolveDateRange(params);
  const supabase = createServerClient();

  const startIso = range.start.toISOString();
  const endIso = range.end.toISOString();

  const deliveryRangeQuery = () =>
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_type', 'delivery')
      .gte('created_at', startIso)
      .lt('created_at', endIso);

  const [
    { count: totalOrdersCount },
    { count: deliveredCount },
    { count: cancelledCount },
    { data: deliveredRows },
  ] = await Promise.all([
    deliveryRangeQuery(),
    deliveryRangeQuery().eq('order_status', 'delivered'),
    deliveryRangeQuery().eq('order_status', 'cancelled'),
    supabase
      .from('orders')
      .select('id,order_number,customer_name,customer_phone,order_type,payment_method,payment_status,order_status,total,created_at')
      .eq('order_type', 'delivery')
      .eq('order_status', 'delivered')
      .gte('created_at', startIso)
      .lt('created_at', endIso)
      .order('created_at', { ascending: false })
      .limit(300),
  ]);

  const deliveredOrders = (deliveredRows ?? []) as OrderRow[];
  const deliveredRevenue = deliveredOrders.reduce((sum, row) => sum + Number(row.total ?? 0), 0);
  const activePreset = range.key;

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-6 print:max-w-none print:space-y-4 print:bg-white print:px-0 print:py-0 print:text-black">
      <div className="space-y-1 print:space-y-2">
        <h1 className="section-title print:text-2xl print:font-bold print:text-black">Delivery Sales Report</h1>
        <p className="text-sm text-muted print:text-sm print:text-black">
          Reporting-only dashboard for delivery sales history. Use the Orders page for live operations and status changes.
        </p>
      </div>

      <section className="rounded-2xl border border-border bg-surface/70 p-4 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/admin?preset=today" className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${activePreset === 'today' ? 'border-primary bg-primary text-black' : 'border-border text-muted hover:text-white'}`}>
            Today
          </Link>
          <Link href="/admin?preset=yesterday" className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${activePreset === 'yesterday' ? 'border-primary bg-primary text-black' : 'border-border text-muted hover:text-white'}`}>
            Yesterday
          </Link>
          <Link href="/admin?preset=this_week" className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${activePreset === 'this_week' ? 'border-primary bg-primary text-black' : 'border-border text-muted hover:text-white'}`}>
            This week
          </Link>
          <Link href="/admin?preset=this_month" className={`rounded-lg border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${activePreset === 'this_month' ? 'border-primary bg-primary text-black' : 'border-border text-muted hover:text-white'}`}>
            This month
          </Link>

          <form method="get" className="ml-auto flex items-center gap-2">
            <label htmlFor="date" className="text-xs font-medium uppercase tracking-wide text-muted">Past date</label>
            <input
              id="date"
              name="date"
              type="date"
              defaultValue={range.selectedDate}
              className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-sm"
            />
            <button type="submit" className="rounded-lg border border-primary/60 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary hover:bg-primary/25">
              Apply
            </button>
          </form>

          <PrintReportButton />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface/60 p-4 print:rounded-none print:border print:border-black print:bg-white">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted print:text-base print:text-black">Report Summary</h2>
        <p className="mt-2 text-xs text-muted print:text-sm print:text-black">
          Selected range: <span className="font-semibold text-white print:text-black">{range.label}</span> ({formatDateTime(startIso)} → {formatDateTime(endIso)})
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 print:mt-3 print:grid-cols-2">
          <StatsCard title="Total orders" value={String(totalOrdersCount ?? 0)} accent />
          <StatsCard title="Delivered orders" value={String(deliveredCount ?? 0)} />
          <StatsCard title="Cancelled orders" value={String(cancelledCount ?? 0)} />
          <StatsCard title="Total revenue" value={formatCurrency(deliveredRevenue)} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface/60 p-4 md:p-5 print:rounded-none print:border print:border-black print:bg-white print:p-0">
        <div className="mb-4 space-y-1 print:mb-2 print:px-3 print:pt-3">
          <h2 className="text-lg font-semibold print:text-lg print:text-black">Delivered Orders</h2>
          <p className="text-xs text-muted print:text-xs print:text-black">Read-only delivered deliveries for the selected date/range.</p>
        </div>

        {deliveredOrders.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm print:text-xs">
              <thead>
                <tr className="border-y border-border text-left text-xs uppercase tracking-wide text-muted print:border-black print:text-black">
                  <th className="px-3 py-2 font-semibold">Order #</th>
                  <th className="px-3 py-2 font-semibold">Customer</th>
                  <th className="px-3 py-2 font-semibold">Payment method</th>
                  <th className="px-3 py-2 font-semibold">Order status</th>
                  <th className="px-3 py-2 font-semibold">Total</th>
                  <th className="px-3 py-2 font-semibold">Created time</th>
                </tr>
              </thead>
              <tbody>
                {deliveredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border/70 text-sm print:border-black/40 print:text-black">
                    <td className="px-3 py-2 font-medium">{order.order_number}</td>
                    <td className="px-3 py-2">{order.customer_name}</td>
                    <td className="px-3 py-2">{order.payment_method.replaceAll('_', ' ')}</td>
                    <td className="px-3 py-2">{order.order_status}</td>
                    <td className="px-3 py-2">{formatCurrency(Number(order.total))}</td>
                    <td className="px-3 py-2">{formatTime(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted print:px-3 print:pb-3 print:text-black">No delivered orders found for this reporting range.</p>
        )}
      </section>
    </div>
  );
}
