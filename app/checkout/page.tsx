'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [restaurantName, setRestaurantName] = useState('Beirut Express');
  const [restaurantOpen, setRestaurantOpen] = useState(true);
  const [restaurantCurrency, setRestaurantCurrency] = useState('KES');
  const [restaurantDeliveryFee, setRestaurantDeliveryFee] = useState(0);
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


  useEffect(() => {
    let mounted = true;

    async function loadRestaurantSettings() {
      try {
        const res = await fetch('/api/restaurant');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setRestaurantName(data.name ?? 'Beirut Express');
        setRestaurantOpen(Boolean(data.is_open));
        setRestaurantCurrency(data.currency ?? 'KES');
        setRestaurantDeliveryFee(Number(data.delivery_fee ?? 0));
      } catch {
        // keep defaults
      }
    }

    loadRestaurantSettings();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(values: CheckoutFormPayload) {
    if (!items.length) {
      setSubmitError('Your cart is empty. Add items before placing an order.');
      return;
    }

    setLoading(true);
    setIsRedirecting(false);
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

      setIsRedirecting(true);
      clear();
      router.push(`${data.redirectTo}?${params.toString()}`);
    } catch (error) {
      console.error('Unexpected checkout submission error', error);
      setSubmitError('Something went wrong while placing your order. Please try again.');
      setIsRedirecting(false);
    } finally {
      setLoading(false);
    }
  }

  const isPending = loading || isRedirecting;
  const orderType = form.watch('orderType');
  const subtotal = cartSubtotal(items);
  const deliveryFee = orderType === 'delivery' ? restaurantDeliveryFee : 0;
  const total = useMemo(() => subtotal + deliveryFee, [subtotal, deliveryFee]);

  if (!items.length && !isPending) {
    return (
      <div>
        <Navbar restaurantName={restaurantName} />
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
      <Navbar restaurantName={restaurantName} />
      <main className="container-padding mx-auto max-w-4xl py-4 md:py-6">
        <h1 className="section-title">Checkout</h1>
        <div className="mt-4 grid gap-4 md:mt-5 md:gap-5 lg:grid-cols-[1.25fr_.9fr]">
          <form className="space-y-3 rounded-2xl border border-border bg-card p-3.5 md:p-4" onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={isPending} className="space-y-3 disabled:opacity-80">
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
            </fieldset>
            {submitError && <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{submitError}</p>}
            {!restaurantOpen && <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-200">This restaurant is currently marked as closed. You can still submit your order for review.</p>}
            <button type="submit" disabled={isPending || !items.length} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-70">{isPending ? 'Placing your order...' : `Place Order · ${formatCurrency(total, restaurantCurrency)}`}</button>
            {isPending && <p className="text-center text-sm text-muted">Placing your order...</p>}
          </form>

          <aside className="rounded-2xl border border-border bg-card p-3.5 md:p-4">
            <p className="font-medium">Order Summary</p>
            <div className="mt-3 space-y-3">
              {items.map((item) => (
                <div key={item.menu_item_id} className="rounded-xl border border-border p-3">
                  <p className="text-sm">{item.item_name}</p>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={isPending} className="rounded-md border border-border px-2 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => updateQty(item.menu_item_id, item.quantity - 1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" disabled={isPending} className="rounded-md border border-border px-2 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => updateQty(item.menu_item_id, item.quantity + 1)}>+</button>
                    </div>
                    <span>{formatCurrency(item.quantity * item.unit_price, restaurantCurrency)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1 text-sm text-muted">
              <p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal, restaurantCurrency)}</span></p>
              <p className="flex justify-between"><span>Delivery fee</span><span>{formatCurrency(deliveryFee, restaurantCurrency)}</span></p>
              <p className="flex justify-between text-base text-white"><span>Total</span><span>{formatCurrency(total, restaurantCurrency)}</span></p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
