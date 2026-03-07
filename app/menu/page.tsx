import { getCategories, getMenuItems, getRestaurant } from '@/lib/data';
import { MenuClient } from './ui';

export default async function MenuPage() {
  const [restaurant, categories, items] = await Promise.all([getRestaurant(), getCategories(), getMenuItems()]);
  return <MenuClient restaurantName={restaurant.name} categories={categories} items={items} />;
}
