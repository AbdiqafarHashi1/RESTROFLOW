import Image from 'next/image';
import { Promotion, Restaurant } from '@/types';

export function HeroSection({ restaurant, promotion }: { restaurant: Restaurant; promotion: Promotion | null }) {
  const heroImage = promotion?.image_url || restaurant.hero_image_url || '/images/hero-food.svg';
  const promoTitle = promotion?.title?.trim();
  const promoSubtitle = promotion?.subtitle?.trim();

  return (
    <section className="container-padding mx-auto max-w-6xl pb-8 pt-5 md:pb-14 md:pt-10">
      <div className="overflow-hidden rounded-[1.75rem] border border-primary/20 bg-gradient-to-b from-[#1f1a12] via-[#141414] to-[#121212] shadow-[0_20px_45px_rgba(0,0,0,0.42)]">
        <div className="grid gap-6 p-5 sm:p-7 md:grid-cols-[1.15fr_0.85fr] md:items-center md:p-10">
          <div className="space-y-5">
            <p className="inline-flex w-fit items-center rounded-full border border-primary/35 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              Serving {restaurant.service_area || restaurant.address || 'Nairobi'}
            </p>
            <header className="space-y-3">
              <h1 className="font-heading text-3xl leading-tight sm:text-4xl md:text-5xl">
                {restaurant.name}
              </h1>
              <p className="max-w-xl text-sm text-muted md:text-base">
                {restaurant.hero_subtitle || restaurant.description || 'Premium Lebanese-inspired meals crafted fresh and delivered fast while still hot.'}
              </p>
            </header>
            <div className="flex flex-wrap gap-3">
              <a href="#menu-section" className="btn-primary min-h-11 min-w-[132px] text-sm md:text-base">Order Now</a>
              <a href="/menu" className="btn-secondary min-h-11 min-w-[132px] text-sm md:text-base">View Full Menu</a>
            </div>
            <p className="text-xs text-muted/90 md:text-sm">{restaurant.opening_hours || 'Open daily for lunch, dinner, and late-night cravings.'}</p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-[#1a1a1a]">
            <div className="relative aspect-[4/3] w-full md:aspect-[5/6]">
              <Image
                src={heroImage}
                alt={promoTitle ? `${promoTitle} promotion banner` : `${restaurant.name} hero food spread`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 42vw"
                className="object-cover"
              />
            </div>
            {promoTitle ? (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 text-white md:p-5">
                <h2 className="text-lg font-semibold md:text-xl">{promoTitle}</h2>
                {promoSubtitle ? <p className="mt-1 text-xs text-white/85 md:text-sm">{promoSubtitle}</p> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
