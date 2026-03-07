import Link from 'next/link';

export default function OrderSuccessPage({
  params,
  searchParams,
}: {
  params: { orderNumber: string };
  searchParams: { total?: string; payment?: string; type?: string; wa?: string };
}) {
  return (
    <main className="container-padding mx-auto max-w-xl py-20 text-center">
      <p className="text-primary">Order placed successfully</p>
      <h1 className="mt-3 font-heading text-4xl">Order #{params.orderNumber}</h1>
      <p className="mt-3 text-muted">Your order is now in the Beirut Express queue. We’ll begin preparation immediately.</p>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-left text-sm">
        <p className="flex justify-between text-muted"><span>Order type</span><span className="text-white">{searchParams.type ?? 'delivery'}</span></p>
        <p className="mt-2 flex justify-between text-muted"><span>Payment method</span><span className="text-white">{searchParams.payment ?? 'cash_on_delivery'}</span></p>
        <p className="mt-2 flex justify-between text-muted"><span>Total</span><span className="text-primary">KES {searchParams.total ?? '-'}</span></p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <a href={searchParams.wa ?? 'https://wa.me/254700000001'} target="_blank" className="btn-primary">Confirm on WhatsApp</a>
        <Link href="/menu" className="btn-secondary">Return to Menu</Link>
      </div>
    </main>
  );
}
