export const MENU_IMAGES_BUCKET = 'menu-images';

export function getMenuBucketMissingMessage() {
  return `Storage bucket '${MENU_IMAGES_BUCKET}' is missing. Create it in Supabase Storage before uploading images.`;
}
