import { notFound } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { formatCurrency, formatDateTime } from '@/lib/formatters';
import { PrintButton } from '@/components/admin/print-button';

export default async function AdminPrintableOrderPage({ params }: { params: { id: string } }) {
  const supabase = createServerClient();

  const { data: order } = await supabase
    .from('orders')
    .select('id,order_number,customer_name,customer_phone,order_type,payment_method,payment_status,order_status,area,address,notes,subtotal,delivery_fee,total,created_at')
    .eq('id', params.id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase
    .from('order_items')
    .select('id,item_name,quantity,unit_price,total_price')
    .eq('order_id', order.id);

  return (
    <main className="mx-auto max-w-3xl p-4 print:max-w-none print:p-0">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <PrintButton />
      </div>

      <section className="rounded-xl border border-border bg-white p-6 text-black print:rounded-none print:border-0">
        <div className="border-b border-black/20 pb-3">
          <h1 className="text-2xl font-semibold">Beirut Express</h1>
          <p className="text-sm">Order Receipt</p>
        </div>

        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
          <div>
            <p><span className="font-semibold">Order #:</span> {order.order_number}</p>
            <p><span className="font-semibold">Date:</span> {formatDateTime(order.created_at)}</p>
            <p><span className="font-semibold">Order type:</span> {order.order_type}</p>
          </div>
          <div>
            <p><span className="font-semibold">Customer:</span> {order.customer_name}</p>
            <p><span className="font-semibold">Phone:</span> {order.customer_phone}</p>
            <p><span className="font-semibold">Area:</span> {order.area || '-'}</p>
          </div>
        </div>

        <div className="mt-3 text-sm">
          <p><span className="font-semibold">Address:</span> {order.address || '-'}</p>
          <p><span className="font-semibold">Notes:</span> {order.notes || '-'}</p>
        </div>

        <table className="mt-5 w-full border-collapse text-sm">
          <thead>
            <tr className="border-y border-black/30 text-left">
              <th className="py-2">Item</th>
              <th className="py-2">Qty</th>
              <th className="py-2 text-right">Unit</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {(items ?? []).map((item) => (
              <tr key={item.id} className="border-b border-black/10">
                <td className="py-2">{item.item_name}</td>
                <td className="py-2">{item.quantity}</td>
                <td className="py-2 text-right">{formatCurrency(Number(item.unit_price))}</td>
                <td className="py-2 text-right">{formatCurrency(Number(item.total_price))}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-full max-w-xs space-y-1 text-sm">
          <p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(Number(order.subtotal))}</span></p>
          <p className="flex justify-between"><span>Delivery Fee</span><span>{formatCurrency(Number(order.delivery_fee))}</span></p>
          <p className="flex justify-between border-t border-black/40 pt-2 font-semibold"><span>Total</span><span>{formatCurrency(Number(order.total))}</span></p>
        </div>

        <div className="mt-5 grid gap-2 border-t border-black/20 pt-3 text-sm sm:grid-cols-2">
          <p><span className="font-semibold">Payment method:</span> {order.payment_method}</p>
          <p><span className="font-semibold">Payment status:</span> {order.payment_status}</p>
          <p><span className="font-semibold">Order status:</span> {order.order_status}</p>
        </div>
      </section>
    </main>
  );
}
