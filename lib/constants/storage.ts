export const MENU_IMAGES_BUCKET = 'images';
export const PROMOTIONS_IMAGES_BUCKET = MENU_IMAGES_BUCKET;
export const HERO_BANNER_PATH = 'hero/home-banner.jpg';

export function getPublicStorageObjectUrl(bucket: string, path: string) {
  return `/storage/v1/object/public/${bucket}/${path}`;
}

export function getMenuBucketMissingMessage() {
  return `Storage bucket '${MENU_IMAGES_BUCKET}' is missing. Create it in Supabase Storage before uploading images.`;
}

export function getPromotionsBucketMissingMessage() {
  return `Storage bucket '${PROMOTIONS_IMAGES_BUCKET}' is missing. Create it in Supabase Storage and upload path '${HERO_BANNER_PATH}'.`;
}

export function getPromotionsUploadErrorMessage() {
  return `Could not upload homepage banner to bucket '${PROMOTIONS_IMAGES_BUCKET}' at path '${HERO_BANNER_PATH}'. Check Supabase Storage bucket settings and upload policies.`;
}
