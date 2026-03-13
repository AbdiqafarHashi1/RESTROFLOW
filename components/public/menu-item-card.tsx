'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';

export function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const [src, setSrc] = useState(item.image_url || '/images/placeholder-food.svg');

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_36px_rgba(0,0,0,0.35)] md:p-4">
      <div className="relative mb-3 overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-[#222] to-[#141414]">
        <div className="relative aspect-[4/3] w-full">
          <Image
            src={src}
            alt={item.name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
            onError={() => setSrc('/images/placeholder-food.svg')}
          />
        </div>
      </div>

      <div className="flex flex-1 flex-col space-y-2.5 px-1 pb-1">
        <h3 className="text-base font-semibold leading-snug md:text-lg">{item.name}</h3>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted md:text-sm">{item.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-1">
          <p className="whitespace-nowrap text-base font-semibold text-primary md:text-lg">{formatCurrency(item.price)}</p>
          <button className="btn-primary rounded-xl px-4 py-2 text-xs font-semibold md:text-sm" onClick={() => onAdd(item)}>Add to Cart</button>
        </div>
      </div>
    </article>
  );
}
