'use client';

import { useMemo, useState } from 'react';
import { Category, MenuItem, Restaurant } from '@/types';
import { HeroSection } from '@/components/public/hero';
import { Navbar } from '@/components/public/navbar';
import { formatCurrency } from '@/lib/formatters';
import { CategoryChips } from '@/components/public/category-chips';
import { MenuItemCard } from '@/components/public/menu-item-card';
import { CartSummary } from '@/components/public/cart-summary';
import { useCart } from '@/lib/use-cart';
import { SiteFooter } from '@/components/public/footer';
import Link from 'next/link';

export function HomeOrdering({ restaurant, categories, items }: { restaurant: Restaurant; categories: Category[]; items: MenuItem[] }) {
  const [active, setActive] = useState('all');
  const [query, setQuery] = useState('');
  const { items: cartItems, addItem } = useCart();
  const featured = useMemo(() => items.filter((i) => i.featured || i.bestseller).slice(0, 4), [items]);

  const filtered = useMemo(() => items.filter((item) => {
    const byCategory = active === 'all' || categories.find((c) => c.id === item.category_id)?.slug === active;
    const bySearch = item.name.toLowerCase().includes(query.toLowerCase());
    return byCategory && bySearch;
  }), [active, categories, items, query]);

  return (
    <div>
      <Navbar restaurantName={restaurant.name} />
      <HeroSection restaurant={restaurant} />

      <section id="bestsellers" className="container-padding mx-auto max-w-6xl py-6 md:py-8">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title">Best Sellers</h2>
            <p className="mt-2 text-sm text-muted">Most-loved wraps, sides and combos customers reorder every day.</p>
          </div>
          <a href="#menu-section" className="hidden text-sm text-primary md:inline">Browse menu ↓</a>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((item) => (
            <div key={item.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs text-primary">Bestseller</p>
              <h3 className="mt-1 font-medium">{item.name}</h3>
              <p className="mt-1 line-clamp-2 text-xs text-muted">{item.description}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-medium text-primary">{formatCurrency(item.price, restaurant.currency)}</span>
                <button className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-black" onClick={() => addItem(item)}>Add</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-padding mx-auto max-w-6xl py-4 md:py-6">
        <h2 className="section-title text-2xl md:text-3xl">Category Shortcuts</h2>
        <p className="mt-2 text-sm text-muted">Jump straight to your cravings with one tap.</p>
        <div className="mt-4 flex flex-wrap gap-2.5">
          {categories.map((category) => (
            <a key={category.id} href="#menu-section" onClick={() => setActive(category.slug)} className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-muted transition hover:border-primary/50 hover:text-white">
              {category.name}
            </a>
          ))}
        </div>
      </section>

      <section id="menu-section" className="container-padding mx-auto max-w-7xl py-8 md:py-10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="section-title">Order Menu</h2>
            <p className="mt-2 text-sm text-muted md:text-base">Quick add from home, or open full menu for focused browsing.</p>
          </div>
          <Link href="/menu" className="text-sm text-primary">View full menu →</Link>
        </div>
        <div className="sticky top-[72px] z-20 -mx-4 mt-5 rounded-2xl border border-border/70 bg-background/90 px-4 py-3 backdrop-blur md:top-[84px]">
          <input
            className="input h-12 rounded-2xl border-border/80 bg-card/95 text-sm md:text-base"
            placeholder="Search kebab wraps, shawarma, sides..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <div className="mt-3">
            <CategoryChips categories={categories} active={active} onChange={setActive} />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.length ? filtered.slice(0, 9).map((item) => <MenuItemCard key={item.id} item={item} onAdd={addItem} />) : (
            <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted">No menu items found for this filter. Try another category.</div>
          )}
        </div>
      </section>

      <section className="container-padding mx-auto grid max-w-6xl gap-4 py-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5"><h3 className="font-heading text-2xl">About {restaurant.name}</h3><p className="mt-2 text-sm text-muted">{restaurant.description || 'Authentic spice profile, balanced portions, and quality ingredients prepped daily.'}</p></div>
        <div id="delivery-info" className="rounded-2xl border border-border bg-card p-5"><h3 className="font-heading text-2xl">Delivery & Pickup</h3><p className="mt-2 text-sm text-muted">Delivering to {restaurant.service_area || '-'}.</p><p className="mt-2 text-sm text-muted">Delivery fee: {formatCurrency(Number(restaurant.delivery_fee ?? 0), restaurant.currency)}</p></div>
        <div id="how-it-works" className="rounded-2xl border border-border bg-card p-5"><h3 className="font-heading text-2xl">Hours & Status</h3><p className="mt-2 text-sm text-muted">{restaurant.opening_hours || 'Opening hours not set.'}</p><p className="mt-2 text-sm text-muted">Currently: <span className={restaurant.is_open ? 'text-emerald-300' : 'text-red-300'}>{restaurant.is_open ? 'Open' : 'Closed'}</span></p></div>
      </section>

      <section className="container-padding mx-auto max-w-6xl py-8">
        <div className="rounded-3xl border border-primary/25 bg-gradient-to-r from-card to-surface p-7">
          <h3 className="font-heading text-3xl">Trusted Taste, Every Order</h3>
          <p className="mt-2 max-w-2xl text-sm text-muted">From kitchen to doorstep handoff, {restaurant.name} is built for reliable quality and speed.</p>
        </div>
      </section>

      <section className="container-padding mx-auto max-w-6xl pb-8">
        <div className="rounded-3xl border border-border bg-card p-7 text-center">
          <h3 className="font-heading text-3xl">Need instant confirmation?</h3>
          <p className="mt-2 text-sm text-muted">Place your order and confirm directly on WhatsApp in one tap.</p>
          <a href={`https://wa.me/${restaurant.whatsapp_number ?? ''}`} className="btn-primary mt-4">Chat on WhatsApp</a>
        </div>
      </section>

      <SiteFooter restaurant={restaurant} />
      <CartSummary items={cartItems} />
    </div>
  );
}
