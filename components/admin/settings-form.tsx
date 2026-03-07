'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  defaultUpdateRestaurantSettingsState,
  updateRestaurantSettings,
} from '@/actions/admin';
import { Restaurant } from '@/types';

function SaveSettingsButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn-primary mt-4" disabled={pending}>
      {pending ? 'Saving settings...' : 'Save Settings'}
    </button>
  );
}

export function SettingsForm({ settings }: { settings: Restaurant }) {
  const [state, formAction] = useActionState(updateRestaurantSettings, defaultUpdateRestaurantSettingsState);

  return (
    <form action={formAction} className="mt-4 rounded-xl border border-border bg-card p-4">
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
      {state.message && (
        <p className={`mt-3 rounded-md border px-3 py-2 text-sm ${state.success ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
          {state.message}
        </p>
      )}
      <SaveSettingsButton />
    </form>
  );
}
