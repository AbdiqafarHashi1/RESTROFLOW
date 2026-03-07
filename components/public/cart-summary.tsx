'use client';

import Link from 'next/link';
import { CartItem } from '@/types';
import { cartSubtotal } from '@/lib/cart';
import { formatCurrency } from '@/lib/formatters';

export function CartSummary({ items }: { items: CartItem[] }) {
  if (!items.length) return null;
  const qty = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-8 md:w-96">
      <Link href="/checkout" className="flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-black shadow-lg shadow-black/30">
        <span className="font-semibold">{qty} item(s)</span>
        <span className="text-sm">Checkout · {formatCurrency(cartSubtotal(items))}</span>
      </Link>
    </div>
  );
}
