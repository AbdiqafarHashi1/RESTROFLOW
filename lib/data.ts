import { cache } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { mockCategories, mockMenuItems, mockRestaurant } from '@/lib/mock-data';
import { Category, MenuItem, Restaurant } from '@/types';

export const getRestaurant = cache(async (): Promise<Restaurant> => {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('restaurants').select('*').eq('slug', 'beirut-express').single();
    return (data as Restaurant) ?? mockRestaurant;
  } catch {
    return mockRestaurant;
  }
});

export const getCategories = cache(async (): Promise<Category[]> => {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('categories').select('*').eq('active', true).order('sort_order');
    return (data as Category[]) ?? mockCategories;
  } catch {
    return mockCategories;
  }
});

export const getMenuItems = cache(async (): Promise<MenuItem[]> => {
  try {
    const supabase = createServerClient();
    const { data } = await supabase.from('menu_items').select('*').eq('active', true).order('sort_order');
    return (data as MenuItem[]) ?? mockMenuItems;
  } catch {
    return mockMenuItems;
  }
});
