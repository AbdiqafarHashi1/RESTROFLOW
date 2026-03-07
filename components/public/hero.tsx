import { Restaurant } from '@/types';

export function HeroSection({ restaurant }: { restaurant: Restaurant }) {
  return (
    <section className="container-padding mx-auto max-w-6xl pb-8 pt-7 md:pb-14 md:pt-14">
      <div className="space-y-5 md:space-y-6">
        <p className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary">
          {restaurant.address || 'Beirut Restaurant'}
        </p>
        <h1 className="font-heading text-3xl leading-tight md:text-6xl">
          {restaurant.hero_title || 'Authentic Indo-Arab Flavour, Delivered Fast'}
        </h1>
        <p className="max-w-3xl text-sm text-muted md:text-base">
          {restaurant.hero_subtitle || restaurant.description || 'Fresh kebab wraps, loaded shawarma, cheesy pizza slices, crisp samosas and karak tea—hot, quick, and crafted for Nairobi cravings.'}
        </p>
      </div>
    </section>
  );
}
