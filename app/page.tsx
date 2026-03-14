import { PublicShell } from '@/components/public/public-shell';
import { getCategories, getMenuItems, getRestaurant } from '@/lib/data';

export default async function HomePage() {
  const [restaurant, categories, menuItems] = await Promise.all([getRestaurant(), getCategories(), getMenuItems()]);
  return <PublicShell restaurant={restaurant} categories={categories} items={menuItems} currentYear={new Date().getFullYear()} />;
}
