import { createServerClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/admin/settings-form';
import { Restaurant } from '@/types';

export default async function AdminSettingsPage() {
  const supabase = createServerClient();
  const { data: settings } = await supabase.from('restaurants').select('*').eq('slug', 'beirut-express').single();

  if (!settings) return <p className="text-muted">Restaurant settings not found.</p>;

  return (
    <div>
      <h1 className="section-title">Settings</h1>
      <p className="mt-1 text-sm text-muted">Structured configuration for brand, operations, delivery, and payment profile.</p>
      <SettingsForm settings={settings as Restaurant} />
    </div>
  );
}
