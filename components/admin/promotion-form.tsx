'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { upsertPromotion } from '@/actions/admin';
import { defaultUpsertPromotionState } from '@/lib/admin-promotions';

function SaveButton() {
  const { pending } = useFormStatus();

  return (
    <button className="btn-secondary" disabled={pending}>
      {pending ? 'Uploading...' : 'Update Homepage Banner'}
    </button>
  );
}

export function PromotionForm() {
  const [state, formAction] = useFormState(upsertPromotion, defaultUpsertPromotionState);

  return (
    <form action={formAction} encType="multipart/form-data" className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">Homepage Hero Banner</p>
        <p className="mt-1 text-lg font-semibold">Upload banner image</p>
        <p className="mt-1 text-sm text-muted">This replaces the homepage hero banner image at <span className="font-mono text-xs text-foreground">hero/home-banner.jpg</span>.</p>
      </div>

      <div className="mt-4 grid gap-3">
        <input name="image_file" className="input" type="file" accept="image/*" required />
      </div>

      {state.message ? (
        <p className={`mt-3 rounded-md border px-3 py-2 text-sm ${state.success ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
          {state.message}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SaveButton />
      </div>
    </form>
  );
}
