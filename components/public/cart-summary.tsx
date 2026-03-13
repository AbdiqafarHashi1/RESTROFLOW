'use client';

import Link from 'next/link';
import { CartItem } from '@/types';
import { cartSubtotal } from '@/lib/cart';
import { formatCurrency } from '@/lib/formatters';

export function CartSummary({ items }: { items: CartItem[] }) {
  if (!items.length) return null;
  const qty = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 md:bottom-4 md:left-auto md:right-8 md:w-96">
      <Link href="/cart" className="flex items-center justify-between rounded-2xl bg-primary px-4 py-3.5 text-black shadow-lg shadow-black/30 md:px-5 md:py-4">
        <span className="font-semibold">{qty} item(s)</span>
        <span className="text-xs md:text-sm">View cart · {formatCurrency(cartSubtotal(items))}</span>
      </Link>
    </div>
  );
}
