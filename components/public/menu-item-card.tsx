'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';

export function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const [src, setSrc] = useState(item.image_url || '/images/placeholder-food.svg');

  return (
    <article className="rounded-2xl border border-border bg-card p-3 md:p-3.5">
      <div className="relative mb-2.5 h-32 overflow-hidden rounded-xl md:mb-3 md:h-36">
        <Image
          src={src}
          alt={item.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
          onError={() => setSrc('/images/placeholder-food.svg')}
        />
      </div>
      <div className="space-y-1.5 md:space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium">{item.name}</h3>
          <p className="text-primary">{formatCurrency(item.price)}</p>
        </div>
        <p className="text-[11px] text-muted md:text-xs">{item.description}</p>
        <button className="btn-primary w-full py-2 text-sm" onClick={() => onAdd(item)}>Add to Cart</button>
      </div>
    </article>
  );
}
