'use server';

import { revalidatePath } from 'next/cache';
import { createServerClient } from '@/lib/supabase/server';
import type { UpdateRestaurantSettingsState } from '@/lib/admin-settings';
import { defaultUpsertMenuItemState, UpsertMenuItemState } from '@/lib/admin-menu';
import { defaultUpsertPromotionState, UpsertPromotionState } from '@/lib/admin-promotions';
import { detectMenuUploadsBucket, getMenuBucketMissingMessage, getPromotionsBucketMissingMessage, getPromotionsUploadErrorMessage, HERO_BANNER_BUCKET, HERO_BANNER_PATH, MENU_IMAGES_BUCKET, getPublicStorageObjectUrl } from '@/lib/constants/storage';

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

export async function updateOrderStatuses(formData: FormData) {
  try {
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
  } catch (error) {
    console.error('Failed to update order statuses', error);
  }
}


export async function quickUpdateOrderState(formData: FormData) {
  try {
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
  } catch (error) {
    console.error('Failed to quick update order state', error);
  }
}

function isMissingBucketError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes('bucket not found') || normalized.includes('bucket does not exist');
}

async function resolveLiveMenuImagesBucket(supabase: ReturnType<typeof createServerClient>) {
  const { data: menuImageRows } = await supabase
    .from('menu_items')
    .select('image_url')
    .not('image_url', 'is', null)
    .limit(200);

  const detectedBucket = detectMenuUploadsBucket((menuImageRows ?? []).map((row) => row.image_url as string | null));
  return detectedBucket ?? MENU_IMAGES_BUCKET;
}

export async function upsertMenuItem(
  _previousState: UpsertMenuItemState,
  formData: FormData,
): Promise<UpsertMenuItemState> {
  try {
    const supabase = createServerClient();
    const id = String(formData.get('id') ?? '');
    const name = String(formData.get('name') ?? '');
    const imageUrlInput = String(formData.get('image_url') ?? '').trim();
    const imageFile = formData.get('image_file');
    let imageUrl = imageUrlInput;

    if (imageFile instanceof File && imageFile.size > 0) {
      const extension = imageFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const filePath = `menu-items/${id || slugify(name) || 'item'}-${crypto.randomUUID()}.${extension}`;
      const liveMenuBucket = await resolveLiveMenuImagesBucket(supabase);
      const { error: uploadError } = await supabase.storage
        .from(liveMenuBucket)
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: true,
          contentType: imageFile.type || 'image/jpeg',
        });

      if (uploadError) {
        if (isMissingBucketError(uploadError.message)) {
          return {
            success: false,
            message: getMenuBucketMissingMessage(liveMenuBucket),
          };
        }

        return {
          success: false,
          message: `Image upload failed: ${uploadError.message}`,
        };
      }

      const { data: publicData } = supabase.storage.from(liveMenuBucket).getPublicUrl(filePath);
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

    const { error } = await supabase.from('menu_items').upsert(payload);
    if (error) {
      return {
        success: false,
        message: `Could not save menu item: ${error.message}`,
      };
    }

    revalidatePath('/menu');
    revalidatePath('/admin/menu');

    return {
      success: true,
      message: id ? 'Menu item updated.' : 'Menu item created.',
    };
  } catch (error) {
    console.error('Unexpected menu item upsert error', error);
    return {
      ...defaultUpsertMenuItemState,
      message: 'Unexpected error while saving this menu item. Please try again.',
    };
  }
}

export async function deleteMenuItem(formData: FormData) {
  try {
    const supabase = createServerClient();
    const id = String(formData.get('id') ?? '');

    if (!id) return;

    await supabase.from('menu_items').delete().eq('id', id);
    revalidatePath('/menu');
    revalidatePath('/admin/menu');
  } catch (error) {
    console.error('Failed to delete menu item', error);
  }
}

export async function upsertCategory(formData: FormData) {
  try {
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
  } catch (error) {
    console.error('Failed to upsert category', error);
  }
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

export async function upsertPromotion(
  _previousState: UpsertPromotionState,
  formData: FormData,
): Promise<UpsertPromotionState> {
  try {
    const supabase = createServerClient();
    const imageFile = formData.get('image_file');
    if (!(imageFile instanceof File) || imageFile.size === 0) {
      return {
        success: false,
        message: 'Please choose an image to upload.',
      };
    }

    const filePath = HERO_BANNER_PATH;
    const heroBucket = HERO_BANNER_BUCKET;
    const { error: uploadError } = await supabase.storage
      .from(heroBucket)
      .upload(filePath, imageFile, {
        cacheControl: '0',
        upsert: true,
        contentType: imageFile.type || 'image/jpeg',
      });

    if (uploadError) {
      if (isMissingBucketError(uploadError.message)) {
        return {
          success: false,
          message: getPromotionsBucketMissingMessage(heroBucket),
        };
      }

      return {
        success: false,
        message: `${getPromotionsUploadErrorMessage(heroBucket)} (${uploadError.message})`,
      };
    }


    const heroPublicUrl = getPublicStorageObjectUrl(heroBucket, filePath);
    console.info('[admin/promotions] Uploaded homepage hero banner.', {
      bucket: heroBucket,
      objectPath: filePath,
      publicUrl: heroPublicUrl,
    });
    const { error: restaurantUpdateError } = await supabase
      .from('restaurants')
      .update({ hero_image_url: heroPublicUrl, updated_at: new Date().toISOString() })
      .eq('slug', 'beirut-express');

    if (restaurantUpdateError) {
      return {
        success: false,
        message: `Banner uploaded, but could not save homepage hero URL: ${restaurantUpdateError.message}`,
      };
    }

    revalidatePath('/');
    revalidatePath('/admin/promotions');

    return {
      success: true,
      message: 'Homepage banner updated successfully',
    };
  } catch (error) {
    console.error('Unexpected promotion upsert error', error);
    return {
      ...defaultUpsertPromotionState,
      message: 'Unexpected error while saving this promotion. Please try again.',
    };
  }
}
