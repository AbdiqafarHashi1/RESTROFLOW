import { createServerClient } from '@/lib/supabase/server';
import { deleteMenuItem, upsertMenuItem } from '@/actions/admin';
import { DeleteMenuItemButton } from '@/components/admin/delete-menu-item-button';

export default async function AdminMenuPage() {
  const supabase = createServerClient();
  const { data: restaurant } = await supabase.from('restaurants').select('id').eq('slug', 'beirut-express').single();
  const { data: categories } = await supabase.from('categories').select('id,name').order('name');
  const { data: menuItems } = await supabase.from('menu_items').select('id,name,description,price,category_id,image_url,active,featured,bestseller').order('created_at', { ascending: false });

  if (!restaurant) return <p className="text-muted">Restaurant not found.</p>;

  return (
    <div>
      <h1 className="section-title">Menu</h1>

      <form action={upsertMenuItem} encType="multipart/form-data" className="mt-4 rounded-xl border border-border bg-card p-4">
        <p className="font-medium">Add Menu Item</p>
        <input type="hidden" name="restaurant_id" value={restaurant.id} />
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input name="name" className="input" placeholder="Name" required />
          <input name="price" className="input" type="number" step="0.01" placeholder="Price" required />
          <select name="category_id" className="input" required>
            <option value="">Select category</option>
            {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input name="image_file" className="input" type="file" accept="image/*" />
        </div>
        <input name="image_url" className="input mt-2" placeholder="Image URL (fallback)" />
        <textarea name="description" className="input mt-2" placeholder="Description" />
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          <label><input type="checkbox" name="active" defaultChecked /> Active</label>
          <label><input type="checkbox" name="featured" /> Featured</label>
          <label><input type="checkbox" name="bestseller" /> Bestseller</label>
        </div>
        <button className="btn-primary mt-3">Add Item</button>
      </form>

      <div className="mt-4 space-y-3">
        {(menuItems ?? []).map((item) => (
          <form key={item.id} action={upsertMenuItem} encType="multipart/form-data" className="rounded-xl border border-border bg-card p-4">
            <input type="hidden" name="id" value={item.id} />
            <input type="hidden" name="restaurant_id" value={restaurant.id} />
            <div className="grid gap-2 md:grid-cols-2">
              <input name="name" className="input" defaultValue={item.name} required />
              <input name="price" className="input" type="number" step="0.01" defaultValue={Number(item.price)} required />
              <select name="category_id" className="input" defaultValue={item.category_id} required>
                {(categories ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <input name="image_file" className="input" type="file" accept="image/*" />
            </div>
            <input name="image_url" className="input mt-2" defaultValue={item.image_url ?? ''} placeholder="Image URL (fallback)" />
            <textarea name="description" className="input mt-2" defaultValue={item.description ?? ''} />
            <div className="mt-2 flex flex-wrap gap-3 text-sm">
              <label><input type="checkbox" name="active" defaultChecked={item.active} /> Active</label>
              <label><input type="checkbox" name="featured" defaultChecked={item.featured} /> Featured</label>
              <label><input type="checkbox" name="bestseller" defaultChecked={item.bestseller} /> Bestseller</label>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button className="btn-secondary">Save</button>
              <DeleteMenuItemButton formAction={deleteMenuItem} itemName={item.name} />
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
