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

function OrdersSection({ title, description, orders }: { title: string; description: string; orders: OrderRow[] }) {
  return (
    <section className="rounded-2xl border border-border bg-surface/60 p-4 shadow-[0_8px_24px_rgba(0,0,0,0.2)] md:p-5">
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
        <p className="text-sm text-muted">No orders in this section.</p>
      )}
    </section>
  );
}

export default async function AdminOrdersPage() {
  const supabase = createServerClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id,order_number,customer_name,customer_phone,order_type,payment_method,payment_status,order_status,total,created_at,area,address,customer_marked_paid')
    .order('created_at', { ascending: false })
    .limit(120);

  const orderRows = (orders ?? []) as OrderRow[];
  const paymentReviewOrders = orderRows.filter(
    (order) => order.payment_method === 'send_money' && order.payment_status === 'pending' && order.customer_marked_paid,
  );
  const urgentOrders = orderRows.filter(
    (order) =>
      (order.order_status === 'new' && order.payment_status === 'pending') ||
      (order.payment_method === 'send_money' && order.payment_status === 'pending' && order.customer_marked_paid),
  );
  const sendMoneyOrders = orderRows.filter((order) => order.payment_method === 'send_money');
  const codOrders = orderRows.filter((order) => order.payment_method === 'cash_on_delivery');
  const pickupOrders = orderRows.filter((order) => order.order_type === 'pickup');
  const preparingOrders = orderRows.filter((order) => order.order_status === 'preparing');
  const outForDeliveryOrders = orderRows.filter((order) => order.order_status === 'out_for_delivery');
  const deliveredOrders = orderRows.filter((order) => order.order_status === 'delivered');

  return (
    <div className="mx-auto w-full max-w-[1800px] space-y-5">
      <div>
        <h1 className="section-title">Orders</h1>
        <p className="mt-1 text-sm text-muted">Desktop now mirrors the compact mobile card system with grouped workflow sections and clear payment separation.</p>
      </div>

      <div className="space-y-4">
        <OrdersSection
          title="Payment Review Needed"
          description={'Send money orders where customers clicked "I Have Paid" and are waiting for verification.'}
          orders={paymentReviewOrders}
        />

        <OrdersSection
          title="Urgent / Priority Orders"
          description="Unpaid newly placed orders and payment-confirmation requests needing immediate action."
          orders={urgentOrders}
        />

        <OrdersSection
          title="Send Money Orders"
          description="All transfer-based orders, including pending payment checks and confirmed send-money flow."
          orders={sendMoneyOrders}
        />

        <OrdersSection title="Cash on Delivery Orders" description="COD workflow separated for fast dispatch handling and handoff." orders={codOrders} />

        <OrdersSection title="Pickup Orders" description="Pickup queue for front-counter preparation and completion." orders={pickupOrders} />

        <OrdersSection title="Preparing" description="Kitchen-in-progress orders currently being prepared." orders={preparingOrders} />

        <OrdersSection title="Out for Delivery" description="Orders currently with riders and in transit." orders={outForDeliveryOrders} />

        <OrdersSection title="Delivered" description="Recently completed orders for review and follow-up." orders={deliveredOrders} />
      </div>
    </div>
  );
}
