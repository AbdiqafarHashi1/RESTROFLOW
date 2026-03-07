'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { deleteMenuItem, upsertMenuItem } from '@/actions/admin';
import { defaultUpsertMenuItemState } from '@/lib/admin-menu';
import { DeleteMenuItemButton } from '@/components/admin/delete-menu-item-button';

type CategoryOption = {
  id: string;
  name: string;
};

type EditableMenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  image_url: string | null;
  active: boolean;
  featured: boolean;
  bestseller: boolean;
};

function SaveButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="btn-secondary" disabled={pending}>
      {pending ? 'Saving...' : isNew ? 'Add Item' : 'Save'}
    </button>
  );
}

export function MenuItemForm({
  categories,
  restaurantId,
  item,
}: {
  categories: CategoryOption[];
  restaurantId: string;
  item?: EditableMenuItem;
}) {
  const [state, formAction] = useFormState(upsertMenuItem, defaultUpsertMenuItemState);
  const isNew = !item;

  return (
    <form action={formAction} encType="multipart/form-data" className="rounded-xl border border-border bg-card p-4">
      {isNew ? <p className="font-medium">Add Menu Item</p> : null}
      <input type="hidden" name="id" defaultValue={item?.id ?? ''} />
      <input type="hidden" name="restaurant_id" value={restaurantId} />
      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <input name="name" className="input" placeholder="Name" defaultValue={item?.name ?? ''} required />
        <input
          name="price"
          className="input"
          type="number"
          step="0.01"
          placeholder="Price"
          defaultValue={item ? Number(item.price) : undefined}
          required
        />
        <select name="category_id" className="input" defaultValue={item?.category_id ?? ''} required>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
        <input name="image_file" className="input" type="file" accept="image/*" />
      </div>

      <input
        name="image_url"
        className="input mt-2"
        defaultValue={item?.image_url ?? ''}
        placeholder="Image URL (fallback)"
      />
      <textarea
        name="description"
        className="input mt-2"
        defaultValue={item?.description ?? ''}
        placeholder="Description"
      />
      <div className="mt-2 flex flex-wrap gap-3 text-sm">
        <label><input type="checkbox" name="active" defaultChecked={item?.active ?? true} /> Active</label>
        <label><input type="checkbox" name="featured" defaultChecked={item?.featured ?? false} /> Featured</label>
        <label><input type="checkbox" name="bestseller" defaultChecked={item?.bestseller ?? false} /> Bestseller</label>
      </div>

      {state.message ? (
        <p className={`mt-3 rounded-md border px-3 py-2 text-sm ${state.success ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>
          {state.message}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <SaveButton isNew={isNew} />
        {item ? <DeleteMenuItemButton formAction={deleteMenuItem} itemName={item.name} /> : null}
      </div>
    </form>
  );
}
