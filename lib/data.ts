import { cache } from 'react';
import { createServerClient } from '@/lib/supabase/server';
import { mockCategories, mockMenuItems, mockRestaurant } from '@/lib/mock-data';
import { Category, MenuItem, Promotion, Restaurant } from '@/types';

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

export const getActivePromotion = cache(async (): Promise<Promotion | null> => {
  try {
    const supabase = createServerClient();
    const { data } = await supabase
      .from('promotions')
      .select('id,title,subtitle,image_url,active,created_at')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return (data as Promotion | null) ?? null;
  } catch {
    return null;
  }
});
