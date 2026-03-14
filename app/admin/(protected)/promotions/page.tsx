import { createServerClient } from '@/lib/supabase/server';
import { PromotionForm } from '@/components/admin/promotion-form';

export default async function AdminPromotionsPage() {
  const supabase = createServerClient();
  const { data: promotions } = await supabase
    .from('promotions')
    .select('id,title,subtitle,image_url,active,created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">Promotions</h1>
        <p className="mt-1 text-sm text-muted">Upload and manage homepage promotion banners. Keep only one promotion active at a time.</p>
      </div>

      <PromotionForm />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Existing Promotions</h2>
        {(promotions ?? []).map((promotion) => (
          <PromotionForm key={promotion.id} promotion={promotion} />
        ))}
      </section>
    </div>
  );
}
