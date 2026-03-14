import { PromotionForm } from '@/components/admin/promotion-form';

export default function AdminPromotionsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">Promotions</h1>
        <p className="mt-1 text-sm text-muted">Upload a single image to control the homepage hero banner.</p>
      </div>

      <PromotionForm />
    </div>
  );
}
