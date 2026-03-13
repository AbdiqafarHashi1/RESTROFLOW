'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Navbar } from '@/components/public/navbar';
import { cartSubtotal } from '@/lib/cart';
import { formatCurrency } from '@/lib/formatters';
import { useCart } from '@/lib/use-cart';

export default function CartPage() {
  const { items, updateQty, removeItem, clear } = useCart();
  const subtotal = cartSubtotal(items);
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  return (
    <div>
      <Navbar restaurantName="Beirut.delivery" />
      <main className="container-padding mx-auto max-w-3xl py-6">
        <h1 className="section-title">Your Cart</h1>

        {!items.length ? (
          <div className="mt-4 rounded-2xl border border-border bg-card p-5 text-center">
            <p className="text-muted">Your cart is empty.</p>
            <Link href="/menu" className="btn-primary mt-4 inline-block">Browse menu</Link>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <article key={item.menu_item_id} className="flex gap-3 rounded-2xl border border-border bg-card p-3">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-border/70 bg-surface">
                  <Image src={item.image_url || '/images/placeholder-food.svg'} alt={item.item_name} fill className="object-cover" />
                </div>
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="font-medium">{item.item_name}</h2>
                    <button className="text-xs text-red-300" onClick={() => removeItem(item.menu_item_id)}>Remove</button>
                  </div>
                  <p className="mt-1 text-sm text-primary">{formatCurrency(item.unit_price)}</p>
                  <div className="mt-auto flex items-center gap-2">
                    <button className="rounded-md border border-border px-2" onClick={() => updateQty(item.menu_item_id, item.quantity - 1)}>-</button>
                    <span className="min-w-5 text-center text-sm">{item.quantity}</span>
                    <button className="rounded-md border border-border px-2" onClick={() => updateQty(item.menu_item_id, item.quantity + 1)}>+</button>
                  </div>
                </div>
              </article>
            ))}

            <section className="rounded-2xl border border-border bg-card p-4">
              <p className="flex justify-between text-sm text-muted"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></p>
              <p className="mt-1 flex justify-between text-sm text-muted"><span>Delivery fee</span><span>{formatCurrency(deliveryFee)}</span></p>
              <p className="mt-2 flex justify-between text-base"><span>Total</span><span>{formatCurrency(total)}</span></p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <button onClick={clear} className="rounded-xl border border-border px-4 py-2 text-sm">Clear cart</button>
                <Link href="/checkout" className="btn-primary text-center">Checkout</Link>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
