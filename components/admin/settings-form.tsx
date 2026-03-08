'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { defaultUpdateRestaurantSettingsState } from '@/lib/admin-settings';
import { updateRestaurantSettings } from '@/actions/admin';
import { Restaurant } from '@/types';

function SaveSettingsButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="btn-primary mt-4" disabled={pending}>
      {pending ? 'Saving settings...' : 'Save Settings'}
    </button>
  );
}

function SettingsSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SettingsForm({ settings }: { settings: Restaurant }) {
  const [state, formAction] = useFormState(updateRestaurantSettings, defaultUpdateRestaurantSettingsState);

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <SettingsSection title="Brand Settings" description="Core restaurant identity shown across menu and checkout.">
          <div className="grid gap-3">
            <input name="name" className="input" defaultValue={settings.name ?? ''} placeholder="Restaurant Name" />
            <textarea name="description" className="input" defaultValue={settings.description ?? ''} placeholder="Description" />
          </div>
        </SettingsSection>

        <SettingsSection title="Contact Information" description="Primary customer channels for ordering and support.">
          <div className="grid gap-3 md:grid-cols-2">
            <input name="phone" className="input" defaultValue={settings.phone ?? ''} placeholder="Phone" />
            <input name="whatsapp_number" className="input" defaultValue={settings.whatsapp_number ?? ''} placeholder="WhatsApp Number" />
            <input name="payment_number" className="input md:col-span-2" defaultValue={settings.payment_number ?? ''} placeholder="Payment Number" />
            <textarea name="address" className="input md:col-span-2" defaultValue={settings.address ?? ''} placeholder="Address" />
          </div>
        </SettingsSection>

        <SettingsSection title="Delivery Settings" description="Delivery area and pricing used at checkout.">
          <div className="grid gap-3 md:grid-cols-2">
            <input name="delivery_fee" className="input" type="number" step="0.01" defaultValue={Number(settings.delivery_fee ?? 0)} placeholder="Delivery Fee" />
            <textarea name="service_area" className="input md:col-span-2" defaultValue={settings.service_area ?? ''} placeholder="Service Area" />
          </div>
        </SettingsSection>



        <SettingsSection title="Opening Hours" description="Operational schedule displayed across customer touchpoints.">
          <input name="opening_hours" className="input" defaultValue={settings.opening_hours ?? ''} placeholder="Opening Hours" />
        </SettingsSection>

        <SettingsSection title="Homepage Content" description="Landing content used on the public menu page.">
          <div className="grid gap-3">
            <input name="hero_title" className="input" defaultValue={settings.hero_title ?? ''} placeholder="Hero Title" />
            <input name="hero_subtitle" className="input" defaultValue={settings.hero_subtitle ?? ''} placeholder="Hero Subtitle" />
          </div>
        </SettingsSection>
      </div>

      <SettingsSection title="Payment Configuration" description="Operational state used by online ordering and admin dashboards.">
        <label className="flex items-center gap-2 text-sm">
          <input name="is_open" type="checkbox" defaultChecked={settings.is_open} />
          Restaurant is Open
        </label>
      </SettingsSection>

      {state.message && (
        <p className={`rounded-md border px-3 py-2 text-sm ${state.success ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
          {state.message}
        </p>
      )}
      <SaveSettingsButton />
    </form>
  );
}
