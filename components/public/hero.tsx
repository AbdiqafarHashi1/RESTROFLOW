'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MenuItem, Restaurant } from '@/types';
import { detectMenuUploadsBucket, getPublicStorageObjectUrl, MENU_IMAGES_BUCKET, HERO_BANNER_PATH } from '@/lib/constants/storage';

export function HeroSection({ restaurant, items }: { restaurant: Restaurant; items: MenuItem[] }) {
  const [showDefault, setShowDefault] = useState(false);
  const detectedMenuBucket = detectMenuUploadsBucket(items.map((item) => item.image_url));
  const homepageHeroBanner = getPublicStorageObjectUrl(detectedMenuBucket ?? MENU_IMAGES_BUCKET, HERO_BANNER_PATH);

  if (showDefault) {
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
                  src="/images/hero-food.svg"
                  alt={`${restaurant.name} hero food spread`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container-padding mx-auto max-w-6xl pb-8 pt-5 md:pb-14 md:pt-10">
      <div className="relative overflow-hidden rounded-[1.75rem] border border-primary/25 bg-[#121212] shadow-[0_20px_45px_rgba(0,0,0,0.45)]">
        <div className="relative aspect-[5/4] w-full sm:aspect-[16/10] lg:aspect-[16/7]">
          <Image
            src={homepageHeroBanner}
            alt={`${restaurant.name} homepage banner`}
            fill
            priority
            sizes="100vw"
            className="object-cover"
            onError={() => setShowDefault(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/25" />

          <div className="absolute inset-0 flex items-end p-4 sm:p-6 md:p-8 lg:p-10">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              <p className="inline-flex w-fit items-center rounded-full border border-[#d4af37]/55 bg-[#d4af37]/18 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#f2d98a]">
                Featured
              </p>
              <h1 className="font-heading text-2xl leading-tight text-white sm:text-4xl md:text-5xl">
                {restaurant.hero_title || `${restaurant.name} Signature Dining`}
              </h1>
              <p className="max-w-xl text-sm text-white/90 sm:text-base md:text-lg">
                {restaurant.hero_subtitle || restaurant.description || 'Premium Lebanese-inspired meals crafted fresh and delivered fast while still hot.'}
              </p>
              <div>
                <a href="#menu-section" className="btn-primary min-h-11 min-w-[132px] text-sm md:text-base">
                  Order Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
