'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { setActivePromotion, upsertPromotion } from '@/actions/admin';
import { defaultUpsertPromotionState } from '@/lib/admin-promotions';

type PromotionRow = {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  active: boolean;
};

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="btn-secondary" disabled={pending}>
      {pending ? 'Saving...' : isNew ? 'Add Promotion' : 'Save'}
    </button>
  );
}

export function PromotionForm({ promotion }: { promotion?: PromotionRow }) {
  const [state, formAction] = useFormState(upsertPromotion, defaultUpsertPromotionState);
  const isNew = !promotion;

  return (
    <form action={formAction} encType="multipart/form-data" className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_24px_rgba(0,0,0,0.2)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{isNew ? 'Create Promotion' : 'Promotion'}</p>
          <p className="mt-1 text-lg font-semibold">{promotion?.title ?? 'Add New Promotion Banner'}</p>
        </div>
        <div className="h-14 w-20 overflow-hidden rounded-lg border border-border bg-surface">
          {promotion?.image_url ? <div className="h-full w-full bg-cover bg-center" style={{ backgroundImage: `url(${promotion.image_url})` }} aria-label={promotion.title} /> : <div className="flex h-full items-center justify-center text-[10px] text-muted">No image</div>}
        </div>
      </div>

      <input type="hidden" name="id" defaultValue={promotion?.id ?? ''} />

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <input name="title" className="input" placeholder="Promotion title" defaultValue={promotion?.title ?? ''} required />
        <input name="subtitle" className="input" placeholder="Promotion subtitle" defaultValue={promotion?.subtitle ?? ''} />
        <input name="image_file" className="input md:col-span-2" type="file" accept="image/*" />
      </div>

      <input name="image_url" className="input mt-3" defaultValue={promotion?.image_url ?? ''} placeholder="Image URL (fallback)" />

      <label className="mt-3 inline-flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={promotion?.active ?? false} />
        Set as active promotion
      </label>

      {state.message ? (
        <p className={`mt-3 rounded-md border px-3 py-2 text-sm ${state.success ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
          {state.message}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <SaveButton isNew={isNew} />
        {!isNew && !promotion?.active ? (
          <button formAction={setActivePromotion} type="submit" name="id" value={promotion.id} className="rounded-lg border border-primary/40 bg-primary/10 px-3 py-2 text-xs font-semibold text-primary">
            Mark Active
          </button>
        ) : null}
      </div>
    </form>
  );
}
