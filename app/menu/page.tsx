import { getCategories, getMenuItems } from '@/lib/data';
import { MenuClient } from './ui';

export default async function MenuPage() {
  const [categories, items] = await Promise.all([getCategories(), getMenuItems()]);
  return <MenuClient categories={categories} items={items} />;
}
