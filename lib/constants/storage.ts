export const MENU_IMAGES_BUCKET = 'menu-images';
export const PROMOTIONS_IMAGES_BUCKET = MENU_IMAGES_BUCKET;

export function getMenuBucketMissingMessage() {
  return `Storage bucket '${MENU_IMAGES_BUCKET}' is missing. Create it in Supabase Storage before uploading images.`;
}

export function getPromotionsBucketMissingMessage() {
  return `Storage bucket '${PROMOTIONS_IMAGES_BUCKET}' is missing. Create it in Supabase Storage before uploading images.`;
}
