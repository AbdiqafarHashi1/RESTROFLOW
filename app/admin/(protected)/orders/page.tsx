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

export default async function AdminOrdersPage() {
  const supabase = createServerClient();
  const { data: orders } = await supabase
    .from('orders')
    .select('id,order_number,customer_name,customer_phone,order_type,payment_method,payment_status,order_status,total,created_at,area,address,customer_marked_paid')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">Orders</h1>
        <p className="mt-1 text-sm text-muted">All orders in a card-based operational layout for faster scanning and one-click actions.</p>
      </div>

      <div className="space-y-3">
        {((orders ?? []) as OrderRow[]).map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
        {!orders?.length && <p className="text-muted">No orders found.</p>}
      </div>
    </div>
  );
}
