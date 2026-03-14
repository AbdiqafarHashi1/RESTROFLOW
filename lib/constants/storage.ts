export const MENU_IMAGES_BUCKET = 'images';
export const PROMOTIONS_IMAGES_BUCKET = MENU_IMAGES_BUCKET;
export const HERO_BANNER_PATH = 'hero/home-banner.jpg';
const SUPABASE_PUBLIC_OBJECT_SEGMENT = '/storage/v1/object/public/';

export function getPublicStorageObjectUrl(bucket: string, path: string) {
  return `/storage/v1/object/public/${bucket}/${path}`;
}

export type MenuImageSource = 'uploaded-storage-image' | 'direct-image-url' | 'legacy-storage-path';

export function detectMenuImageSource(imageUrl: string | null | undefined): MenuImageSource {
  if (!imageUrl) return 'legacy-storage-path';

  if (imageUrl.includes(SUPABASE_PUBLIC_OBJECT_SEGMENT)) {
    return 'uploaded-storage-image';
  }

  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://') || imageUrl.startsWith('//')) {
    return 'direct-image-url';
  }

  return 'legacy-storage-path';
}

export function extractSupabasePublicBucket(imageUrl: string | null | undefined): string | null {
  if (!imageUrl) return null;

  const markerIndex = imageUrl.indexOf(SUPABASE_PUBLIC_OBJECT_SEGMENT);
  if (markerIndex === -1) return null;

  const pathAfterSegment = imageUrl.slice(markerIndex + SUPABASE_PUBLIC_OBJECT_SEGMENT.length);
  const [bucket] = pathAfterSegment.split('/');
  return bucket || null;
}

export function detectMenuUploadsBucket(imageUrls: Array<string | null | undefined>): string | null {
  for (const imageUrl of imageUrls) {
    const source = detectMenuImageSource(imageUrl);
    if (source !== 'uploaded-storage-image') continue;

    const bucket = extractSupabasePublicBucket(imageUrl);
    if (bucket) return bucket;
  }

  return null;
}

export function getMenuBucketMissingMessage(bucket = MENU_IMAGES_BUCKET) {
  return `Storage bucket '${bucket}' is missing. Create it in Supabase Storage before uploading images.`;
}

export function getPromotionsBucketMissingMessage(bucket = PROMOTIONS_IMAGES_BUCKET) {
  return `Storage bucket '${bucket}' is missing. Create it in Supabase Storage and upload path '${HERO_BANNER_PATH}'.`;
}

export function getPromotionsUploadErrorMessage(bucket = PROMOTIONS_IMAGES_BUCKET) {
  return `Could not upload homepage banner to bucket '${bucket}' at path '${HERO_BANNER_PATH}'. Check Supabase Storage bucket settings and upload policies.`;
}
