import { PublicShell } from '@/components/public/public-shell';
import { getActivePromotion, getCategories, getMenuItems, getRestaurant } from '@/lib/data';

export default async function HomePage() {
  const [restaurant, categories, menuItems, activePromotion] = await Promise.all([getRestaurant(), getCategories(), getMenuItems(), getActivePromotion()]);
  return <PublicShell restaurant={restaurant} categories={categories} items={menuItems} currentYear={new Date().getFullYear()} promotion={activePromotion} />;
}
