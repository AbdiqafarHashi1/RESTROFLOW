import Link from 'next/link';
import { MarkPaidButton } from '@/components/public/mark-paid-button';

export default function OrderPendingPaymentPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { total?: string; payment?: string; type?: string; wa?: string; paymentNumber?: string; restaurantPhone?: string; customerPhone?: string };
}) {
  return (
    <main className="container-padding mx-auto max-w-xl py-6 md:py-8">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Payment Pending</p>
      <h1 className="mt-3 text-center font-heading text-3xl">Order Received — Payment Pending</h1>
      <p className="mt-2 text-center text-muted">Order #{params.orderNumber}</p>

      <div className="mt-5 rounded-2xl border border-amber-300/40 bg-card p-4 md:mt-6 md:p-5">
        <p className="text-center text-lg font-semibold text-amber-300">Payment Pending</p>
        <p className="mt-4 flex justify-between text-sm text-muted"><span>Total Amount</span><span className="text-white">KES {searchParams.total ?? '-'}</span></p>
        <p className="mt-2 flex justify-between text-sm text-muted"><span>Send Money Number</span><span className="text-white">{searchParams.paymentNumber || '-'}</span></p>
        <p className="mt-2 text-sm text-muted">Please send the exact amount and include order number <span className="text-white">{params.orderNumber}</span> in your transfer message.</p>
      </div>

      <div className="mt-3 rounded-2xl border border-border bg-card p-4 text-sm md:mt-4 md:p-5">
        <p className="flex justify-between text-muted"><span>Order Type</span><span className="text-white">{searchParams.type ?? '-'}</span></p>
        <p className="mt-2 flex justify-between text-muted"><span>Payment Method</span><span className="text-white">{searchParams.payment ?? 'send_money'}</span></p>
        <p className="mt-2 flex justify-between text-muted"><span>Restaurant Phone</span><span className="text-white">{searchParams.restaurantPhone ?? '-'}</span></p>
        <p className="mt-2 flex justify-between text-muted"><span>Your Phone</span><span className="text-white">{searchParams.customerPhone ?? '-'}</span></p>
      </div>

      <div className="mt-4 grid gap-3">
        <a href={searchParams.wa ?? 'https://wa.me/254700000001'} target="_blank" rel="noreferrer" className="btn-primary w-full text-center">WhatsApp Us</a>
        <a href={`tel:${searchParams.restaurantPhone ?? ''}`} className="btn-secondary w-full text-center">Call Restaurant</a>
        <MarkPaidButton orderNumber={params.orderNumber} />
        <Link href="/menu" className="btn-secondary w-full text-center">Return to Menu</Link>
      </div>
    </main>
  );
}
