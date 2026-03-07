import { HomeOrdering } from '@/components/public/home-ordering';
import { getCategories, getMenuItems, getRestaurant } from '@/lib/data';

export default async function HomePage() {
  const [restaurant, categories, menuItems] = await Promise.all([getRestaurant(), getCategories(), getMenuItems()]);
  return <HomeOrdering restaurant={restaurant} categories={categories} items={menuItems} />;
}
