import { createServerClient } from '@/lib/supabase/server';
import { updateRestaurantSettings } from '@/actions/admin';

export default async function AdminSettingsPage() {
  const supabase = createServerClient();
  const { data: settings } = await supabase.from('restaurants').select('*').eq('slug', 'beirut-express').single();

  if (!settings) return <p className="text-muted">Restaurant settings not found.</p>;

  return (
    <div>
      <h1 className="section-title">Settings</h1>
      <form action={updateRestaurantSettings} className="mt-4 rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2">
          <input name="name" className="input" defaultValue={settings.name ?? ''} placeholder="Restaurant Name" />
          <input name="phone" className="input" defaultValue={settings.phone ?? ''} placeholder="Phone" />
          <input name="whatsapp_number" className="input" defaultValue={settings.whatsapp_number ?? ''} placeholder="WhatsApp Number" />
          <input name="payment_number" className="input" defaultValue={settings.payment_number ?? ''} placeholder="Payment Number" />
          <input name="delivery_fee" className="input" type="number" step="0.01" defaultValue={Number(settings.delivery_fee ?? 0)} placeholder="Delivery Fee" />
          <input name="opening_hours" className="input" defaultValue={settings.opening_hours ?? ''} placeholder="Opening Hours" />
          <input name="hero_title" className="input" defaultValue={settings.hero_title ?? ''} placeholder="Hero Title" />
          <input name="hero_subtitle" className="input" defaultValue={settings.hero_subtitle ?? ''} placeholder="Hero Subtitle" />
        </div>
        <textarea name="description" className="input mt-3" defaultValue={settings.description ?? ''} placeholder="Description" />
        <textarea name="address" className="input mt-3" defaultValue={settings.address ?? ''} placeholder="Address" />
        <textarea name="service_area" className="input mt-3" defaultValue={settings.service_area ?? ''} placeholder="Service Area" />
        <label className="mt-3 flex items-center gap-2 text-sm"><input name="is_open" type="checkbox" defaultChecked={settings.is_open} /> Restaurant is Open</label>
        <button className="btn-primary mt-4">Save Settings</button>
      </form>
    </div>
  );
}
