'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { checkoutFormSchema, CheckoutFormPayload } from '@/lib/validators';
import { useCart } from '@/lib/use-cart';
import { cartSubtotal } from '@/lib/cart';
import { formatCurrency } from '@/lib/formatters';
import { Navbar } from '@/components/public/navbar';

export default function CheckoutPage() {
  const { items, clear, updateQty } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const form = useForm<CheckoutFormPayload>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      orderType: 'delivery',
      paymentMethod: 'cash_on_delivery',
      area: '',
      address: '',
      notes: '',
    },
  });

  async function onSubmit(values: CheckoutFormPayload) {
    if (!items.length) {
      setSubmitError('Your cart is empty. Add items before placing an order.');
      return;
    }

    setLoading(true);
    setSubmitError('');

    const payload = {
      ...values,
      items: items.map((i) => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
    };

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const fallback = 'Could not place your order. Please try again.';
        const errorMessage = typeof data?.error === 'string'
          ? data.error
          : (data?.error?.formErrors?.[0] ?? fallback);
        console.error('Checkout submission failed', { status: res.status, data });
        setSubmitError(errorMessage);
        return;
      }

      clear();

      const params = new URLSearchParams({
        total: String(data.total),
        payment: data.paymentMethod,
        type: data.orderType,
        wa: data.whatsappUrl,
        paymentStatus: data.paymentStatus,
        paymentNumber: data.paymentNumber ?? '',
        restaurantPhone: data.restaurantPhone ?? '',
        customerPhone: data.customerPhone ?? '',
      });

      router.push(`${data.redirectTo}?${params.toString()}`);
    } catch (error) {
      console.error('Unexpected checkout submission error', error);
      setSubmitError('Something went wrong while placing your order. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const orderType = form.watch('orderType');
  const subtotal = cartSubtotal(items);
  const deliveryFee = orderType === 'delivery' ? 150 : 0;
  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  if (!items.length) {
    return (
      <div>
        <Navbar />
        <main className="container-padding mx-auto max-w-xl py-20 text-center">
          <h1 className="font-heading text-4xl">Your cart is empty</h1>
          <p className="mt-3 text-muted">Add your favourite wraps, shawarma and sides before checkout.</p>
          <Link href="/menu" className="btn-primary mt-5">Browse Menu</Link>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <main className="container-padding mx-auto max-w-4xl py-6">
        <h1 className="section-title">Checkout</h1>
        <div className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_.9fr]">
          <form className="space-y-3 rounded-2xl border border-border bg-card p-4" onSubmit={form.handleSubmit(onSubmit)}>
            <input className="input" placeholder="Full name" {...form.register('customerName')} />
            {form.formState.errors.customerName && <p className="text-xs text-red-400">Enter a valid name.</p>}
            <input className="input" placeholder="Phone number" {...form.register('customerPhone')} />
            {form.formState.errors.customerPhone && <p className="text-xs text-red-400">Enter a valid phone number.</p>}
            <select className="input" {...form.register('orderType')}><option value="delivery">Delivery</option><option value="pickup">Pickup</option></select>
            {orderType === 'delivery' && <>
              <input className="input" placeholder="Area / Estate" {...form.register('area')} />
              {form.formState.errors.area && <p className="text-xs text-red-400">Area is required for delivery.</p>}
              <textarea className="input" placeholder="Exact address or landmark" {...form.register('address')} />
              {form.formState.errors.address && <p className="text-xs text-red-400">Address is required for delivery.</p>}
            </>}
            <textarea className="input" placeholder="Notes (optional)" {...form.register('notes')} />
            <select className="input" {...form.register('paymentMethod')}>
              <option value="cash_on_delivery">Cash on Delivery</option>
              <option value="pay_on_pickup">Pay on Pickup</option>
              <option value="send_money">Send Money</option>
            </select>
            {submitError && <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{submitError}</p>}
            <button type="submit" disabled={loading || !items.length} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">{loading ? 'Placing order...' : `Place Order · ${formatCurrency(total)}`}</button>
          </form>

          <aside className="rounded-2xl border border-border bg-card p-4">
            <p className="font-medium">Order Summary</p>
            <div className="mt-3 space-y-3">
              {items.map((item) => (
                <div key={item.menu_item_id} className="rounded-xl border border-border p-3">
                  <p className="text-sm">{item.item_name}</p>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <button type="button" className="rounded-md border border-border px-2" onClick={() => updateQty(item.menu_item_id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" className="rounded-md border border-border px-2" onClick={() => updateQty(item.menu_item_id, item.quantity + 1)}>+</button>
                    </div>
                    <span>{formatCurrency(item.quantity * item.unit_price)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 text-sm text-muted">
              <p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></p>
              <p className="flex justify-between"><span>Delivery fee</span><span>{formatCurrency(deliveryFee)}</span></p>
              <p className="flex justify-between text-base text-white"><span>Total</span><span>{formatCurrency(total)}</span></p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
