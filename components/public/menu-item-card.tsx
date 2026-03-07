'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';

export function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const [src, setSrc] = useState(item.image_url || '/images/placeholder-food.svg');

  return (
    <article className="rounded-2xl border border-border bg-card p-3">
      <div className="relative mb-3 h-36 overflow-hidden rounded-xl">
        <Image src={src} alt={item.name} fill className="object-cover" onError={() => setSrc('/images/placeholder-food.svg')} />
      </div>
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-primary">{formatCurrency(item.price)}</p>
        </div>
        <p className="text-xs text-muted">{item.description}</p>
        <button className="btn-primary w-full py-2 text-sm" onClick={() => onAdd(item)}>Add to Cart</button>
      </div>
    </article>
  );
}
