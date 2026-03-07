'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import type { UpdateRestaurantSettingsState } from '@/lib/admin-settings';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function updateOrderStatuses(formData: FormData) {
  const orderId = String(formData.get('orderId') ?? '');
  const orderStatus = String(formData.get('orderStatus') ?? '');
  const paymentStatus = String(formData.get('paymentStatus') ?? '');

  if (!orderId) return;

  const supabase = createServerClient();
  await supabase.from('orders').update({ order_status: orderStatus, payment_status: paymentStatus }).eq('id', orderId);

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}/print`);
}


export async function quickUpdateOrderState(formData: FormData) {
  const orderId = String(formData.get('orderId') ?? '');
  const orderStatus = formData.get('orderStatus');
  const paymentStatus = formData.get('paymentStatus');

  if (!orderId) return;

  const payload: { order_status?: string; payment_status?: string } = {};
  if (typeof orderStatus === 'string' && orderStatus) payload.order_status = orderStatus;
  if (typeof paymentStatus === 'string' && paymentStatus) payload.payment_status = paymentStatus;

  if (!Object.keys(payload).length) return;

  const supabase = createServerClient();
  await supabase.from('orders').update(payload).eq('id', orderId);

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath(`/admin/orders/${orderId}/print`);
}

export async function upsertMenuItem(formData: FormData) {
  const supabase = createServerClient();
  const id = String(formData.get('id') ?? '');
  const name = String(formData.get('name') ?? '');
  const imageUrlInput = String(formData.get('image_url') ?? '').trim();
  const imageFile = formData.get('image_file');
  let imageUrl = imageUrlInput;

  if (imageFile instanceof File && imageFile.size > 0) {
    const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `menu-items/${id || slugify(name) || 'item'}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, imageFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: imageFile.type || 'image/jpeg',
      });

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    const { data: publicData } = supabase.storage.from('menu-images').getPublicUrl(filePath);
    imageUrl = publicData.publicUrl;
  }

  const payload = {
    id: id || undefined,
    restaurant_id: String(formData.get('restaurant_id')),
    category_id: String(formData.get('category_id')),
    name,
    slug: slugify(name),
    description: String(formData.get('description') ?? ''),
    price: Number(formData.get('price') ?? 0),
    image_url: imageUrl,
    active: formData.get('active') === 'on',
    featured: formData.get('featured') === 'on',
    bestseller: formData.get('bestseller') === 'on',
  };

  await supabase.from('menu_items').upsert(payload);
  revalidatePath('/menu');
  revalidatePath('/admin/menu');
}

export async function deleteMenuItem(formData: FormData) {
  const supabase = createServerClient();
  const id = String(formData.get('id') ?? '');

  if (!id) return;

  await supabase.from('menu_items').delete().eq('id', id);
  revalidatePath('/menu');
  revalidatePath('/admin/menu');
}

export async function upsertCategory(formData: FormData) {
  const supabase = createServerClient();
  const name = String(formData.get('name') ?? '');
  const payload = {
    id: String(formData.get('id') ?? '') || undefined,
    restaurant_id: String(formData.get('restaurant_id')),
    name,
    slug: slugify(name),
    active: formData.get('active') === 'on',
  };
  await supabase.from('categories').upsert(payload);
  revalidatePath('/menu');
  revalidatePath('/admin/categories');
  revalidatePath('/admin/menu');
}

export async function updateRestaurantSettings(
  _previousState: UpdateRestaurantSettingsState,
  formData: FormData,
): Promise<UpdateRestaurantSettingsState> {
  try {
    const supabase = createServerClient();
    const values = {
      name: String(formData.get('name') ?? ''),
      description: String(formData.get('description') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      whatsapp_number: String(formData.get('whatsapp_number') ?? ''),
      payment_number: String(formData.get('payment_number') ?? ''),
      address: String(formData.get('address') ?? ''),
      service_area: String(formData.get('service_area') ?? ''),
      delivery_fee: Number(formData.get('delivery_fee') ?? 0),
      opening_hours: String(formData.get('opening_hours') ?? ''),
      is_open: formData.get('is_open') === 'on',
      hero_title: String(formData.get('hero_title') ?? ''),
      hero_subtitle: String(formData.get('hero_subtitle') ?? ''),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('restaurants').update(values).eq('slug', 'beirut-express');

    if (error) {
      console.error('Failed to update restaurant settings', error);
      return {
        success: false,
        message: 'Could not save settings. Please try again.',
      };
    }

    revalidatePath('/');
    revalidatePath('/menu');
    revalidatePath('/checkout');
    revalidatePath('/admin/settings');

    return {
      success: true,
      message: 'Settings saved successfully.',
    };
  } catch (error) {
    console.error('Unexpected settings update error', error);
    return {
      success: false,
      message: 'Unexpected error while saving settings. Please try again.',
    };
  }
}
