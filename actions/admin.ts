'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = createServerClient();
  return supabase.from('orders').update({ status }).eq('id', orderId);
}

export async function upsertMenuItem(values: Record<string, unknown>) {
  const supabase = createServerClient();
  return supabase.from('menu_items').upsert(values);
}

export async function upsertCategory(values: Record<string, unknown>) {
  const supabase = createServerClient();
  return supabase.from('categories').upsert(values);
}

export async function updateRestaurantSettings(values: Record<string, unknown>) {
  const supabase = createServerClient();
  return supabase.from('restaurants').update(values).eq('slug', 'beirut-express');
}
