'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MenuItem } from '@/types';
import { formatCurrency } from '@/lib/formatters';

export function MenuItemCard({ item, onAdd }: { item: MenuItem; onAdd: (item: MenuItem) => void }) {
  const [src, setSrc] = useState(item.image_url || '/images/placeholder-food.svg');

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-3.5 shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_16px_36px_rgba(0,0,0,0.35)] md:p-4">
      <div className="relative mb-3 flex h-52 items-center justify-center overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-[#1e1e1e] to-[#141414] md:h-56">
        <Image
          src={src}
          alt={item.name}
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 900px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-contain p-2 transition duration-300 group-hover:scale-[1.02]"
          onError={() => setSrc('/images/placeholder-food.svg')}
        />
      </div>
      <div className="flex flex-1 flex-col space-y-2.5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold leading-tight md:text-lg">{item.name}</h3>
          <p className="whitespace-nowrap rounded-full bg-primary/15 px-2.5 py-1 text-sm font-semibold text-primary">{formatCurrency(item.price)}</p>
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted md:text-sm">{item.description}</p>
        <button className="btn-primary mt-auto w-full rounded-2xl py-2.5 text-sm font-semibold active:scale-[0.99]" onClick={() => onAdd(item)}>Add to Cart</button>
      </div>
    </article>
  );
}
