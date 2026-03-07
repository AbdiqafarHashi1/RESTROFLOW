import { OrderStatusBadge } from '@/components/admin/order-status-badge';

export default function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-4">
      <h1 className="section-title">Order {params.id}</h1>
      <div className="rounded-xl border border-border bg-card p-4">
        <p>Customer: Demo Customer</p>
        <p>Phone: +254700000000</p>
        <p>Address: South B, Nairobi</p>
        <p>Payment: cash_on_delivery</p>
        <p>Status: <OrderStatusBadge status="new" /></p>
      </div>
      <form className="rounded-xl border border-border bg-card p-4">
        <label className="text-sm text-muted">Update status</label>
        <select className="input mt-2">
          <option>new</option><option>confirmed</option><option>preparing</option><option>out_for_delivery</option><option>delivered</option><option>cancelled</option>
        </select>
        <button className="btn-primary mt-3">Save status</button>
      </form>
    </div>
  );
}
