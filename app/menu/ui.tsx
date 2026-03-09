'use client';

import { useMemo, useState } from 'react';
import { Category, MenuItem } from '@/types';
import { CategoryChips } from '@/components/public/category-chips';
import { MenuItemCard } from '@/components/public/menu-item-card';
import { CartSummary } from '@/components/public/cart-summary';
import { Navbar } from '@/components/public/navbar';
import { useCart } from '@/lib/use-cart';

export function MenuClient({ restaurantName, categories, items }: { restaurantName: string; categories: Category[]; items: MenuItem[] }) {
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const { items: cartItems, addItem } = useCart();

  const categorySlugById = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((category) => map.set(category.id, category.slug));
    return map;
  }, [categories]);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => items.filter((item) => {
    const categorySlug = categorySlugById.get(item.category_id);
    const byCategory = active === 'all' || categorySlug === active;
    const bySearch = !normalizedQuery || item.name.toLowerCase().includes(normalizedQuery);
    return byCategory && bySearch;
  }), [active, categorySlugById, items, normalizedQuery]);

  return (
    <div>
      <Navbar restaurantName={restaurantName} />
      <main className="container-padding mx-auto max-w-7xl py-6 md:py-8">
        <h1 className="section-title">Menu</h1>
        <p className="mt-2 text-sm text-muted md:text-base">Browse by category and add to cart in seconds.</p>
        <div className="sticky top-[72px] z-20 -mx-4 mt-5 border-y border-border/70 bg-background/90 px-4 py-3 backdrop-blur md:top-[84px]">
          <input
            className="input h-12 rounded-2xl border-border/80 bg-card/95 text-sm md:text-base"
            placeholder="Search kebab wraps, shawarma, drinks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-3">
            <CategoryChips categories={categories} active={active} onChange={setActive} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.length ? filtered.map((item) => <MenuItemCard key={item.id} item={item} onAdd={addItem} />) : (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted">No items match your filter right now. Try another category or search term.</div>
          )}
        </div>
      </main>
      <CartSummary items={cartItems} />
    </div>
  );
}
