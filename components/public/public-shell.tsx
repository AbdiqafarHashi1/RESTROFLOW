'use client';

import { useEffect } from 'react';
import { Category, MenuItem, Promotion, Restaurant } from '@/types';
import { HomeOrdering } from '@/components/public/home-ordering';
import { PublicErrorBoundary } from '@/components/public/public-error-boundary';

export function PublicShell({
  restaurant,
  categories,
  items,
  currentYear,
  promotion,
}: {
  restaurant: Restaurant;
  categories: Category[];
  items: MenuItem[];
  currentYear: number;
  promotion: Promotion | null;
}) {
  useEffect(() => {
    console.info('[public-shell] Hydrated customer shell.', {
      categories: categories.length,
      items: items.length,
      hasRestaurant: Boolean(restaurant?.id),
    });
  }, [categories.length, items.length, restaurant?.id]);

  return (
    <PublicErrorBoundary>
      <HomeOrdering restaurant={restaurant} categories={categories} items={items} currentYear={currentYear} promotion={promotion} />
    </PublicErrorBoundary>
  );
}
