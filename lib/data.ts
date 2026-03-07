import { createServerClient } from '@/lib/supabase/server';
import { mockCategories, mockMenuItems, mockRestaurant } from '@/lib/mock-data';
import { Category, MenuItem, Restaurant } from '@/types';

export async function getRestaurant(): Promise<Restaurant> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('restaurants').select('*').eq('slug', 'beirut-express').single();
    return (data as Restaurant) ?? mockRestaurant;
  } catch {
    return mockRestaurant;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('categories').select('*').eq('active', true).order('sort_order');
    return (data as Category[]) ?? mockCategories;
  } catch {
    return mockCategories;
  }
}

export async function getMenuItems(): Promise<MenuItem[]> {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('menu_items').select('*').eq('active', true).order('sort_order');
    return (data as MenuItem[]) ?? mockMenuItems;
  } catch {
    return mockMenuItems;
  }
}
