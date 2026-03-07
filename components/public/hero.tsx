import Link from 'next/link';
import { Clock3, ShieldCheck, Truck } from 'lucide-react';

export function HeroSection() {
  return (
    <section className="container-padding mx-auto grid max-w-6xl gap-6 pb-10 pt-10 md:grid-cols-2 md:pb-14 md:pt-14">
      <div className="space-y-6">
        <p className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">BBS Mall, Nairobi · Beirut Restaurant</p>
        <h1 className="font-heading text-4xl leading-tight md:text-6xl">Authentic Indo-Arab Flavour, Delivered Fast</h1>
        <p className="max-w-xl text-muted">Fresh kebab wraps, loaded shawarma, cheesy pizza slices, crisp samosas and karak tea—hot, quick, and crafted for Nairobi cravings.</p>
        <div className="flex flex-wrap gap-3">
          <Link className="btn-primary" href="#menu-section">Order Now</Link>
          <Link className="btn-secondary" href="/menu">Open Full Menu</Link>
        </div>
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-3"><Truck className="mb-2 h-4 w-4 text-primary" />Fast city delivery</div>
          <div className="rounded-xl border border-border bg-card p-3"><ShieldCheck className="mb-2 h-4 w-4 text-primary" />Pay on delivery / pickup</div>
          <div className="rounded-xl border border-border bg-card p-3"><Clock3 className="mb-2 h-4 w-4 text-primary" />Prepared fresh to order</div>
        </div>
      </div>
      <div className="min-h-80 overflow-hidden rounded-3xl border border-border bg-[url('/images/hero-food.svg')] bg-cover bg-center shadow-2xl shadow-black/30" />
    </section>
  );
}
