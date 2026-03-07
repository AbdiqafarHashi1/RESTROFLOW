'use client';

import { useMemo, useState } from 'react';
import { Category, MenuItem } from '@/types';
import { CategoryChips } from '@/components/public/category-chips';
import { MenuItemCard } from '@/components/public/menu-item-card';
import { CartSummary } from '@/components/public/cart-summary';
import { Navbar } from '@/components/public/navbar';
import { useCart } from '@/lib/use-cart';

export function MenuClient({ categories, items }: { categories: Category[]; items: MenuItem[] }) {
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const { items: cartItems, addItem } = useCart();

  const filtered = useMemo(() => items.filter((item) => {
    const byCategory = active === 'all' || categories.find((c) => c.id === item.category_id)?.slug === active;
    const bySearch = item.name.toLowerCase().includes(query.toLowerCase());
    return byCategory && bySearch;
  }), [active, categories, items, query]);

  return (
    <div>
      <Navbar />
      <main className="container-padding mx-auto max-w-6xl py-6">
        <h1 className="section-title">Menu</h1>
        <p className="mt-2 text-sm text-muted">Browse by category and add to cart in seconds.</p>
        <input className="input my-4" placeholder="Search wraps, shawarma, drinks..." value={query} onChange={(e) => setQuery(e.target.value)} />
        <CategoryChips categories={categories} active={active} onChange={setActive} />
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.length ? filtered.map((item) => <MenuItemCard key={item.id} item={item} onAdd={addItem} />) : (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted">No items match your filter right now. Try another category or search term.</div>
          )}
        </div>
      </main>
      <CartSummary items={cartItems} />
    </div>
  );
}
