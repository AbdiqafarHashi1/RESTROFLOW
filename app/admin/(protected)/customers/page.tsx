import { createServerClient } from '@/lib/supabase/server';

export default async function AdminCustomersPage() {
  const supabase = createServerClient();
  const { data: customers } = await supabase
    .from('customers')
    .select('id,name,phone,total_orders,last_order_at')
    .order('last_order_at', { ascending: false, nullsFirst: false });

  return (
    <div>
      <h1 className="section-title">Customers</h1>
      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-muted">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Total Orders</th>
              <th className="p-3">Last Order</th>
            </tr>
          </thead>
          <tbody>
            {(customers ?? []).map((customer) => (
              <tr key={customer.id} className="border-t border-border">
                <td className="p-3">{customer.name}</td>
                <td className="p-3">{customer.phone}</td>
                <td className="p-3">{customer.total_orders}</td>
                <td className="p-3">{customer.last_order_at ? new Date(customer.last_order_at).toLocaleString() : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
