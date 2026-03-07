import { createServerClient } from '@/lib/supabase/server';
import { upsertCategory } from '@/actions/admin';

export default async function AdminCategoriesPage() {
  const supabase = createServerClient();
  const { data: restaurant } = await supabase.from('restaurants').select('id').eq('slug', 'beirut-express').single();
  const { data: categories } = await supabase.from('categories').select('id,name,active').order('sort_order');

  if (!restaurant) return <p className="text-muted">Restaurant not found.</p>;

  return (
    <div>
      <h1 className="section-title">Categories</h1>

      <form action={upsertCategory} className="mt-4 rounded-xl border border-border bg-card p-4">
        <p className="font-medium">Add Category</p>
        <input type="hidden" name="restaurant_id" value={restaurant.id} />
        <div className="mt-3 flex gap-2">
          <input name="name" className="input" placeholder="Category name" required />
          <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked /> Active</label>
          <button className="btn-primary">Add</button>
        </div>
      </form>

      <div className="mt-4 space-y-3">
        {(categories ?? []).map((category) => (
          <form key={category.id} action={upsertCategory} className="rounded-xl border border-border bg-card p-4">
            <input type="hidden" name="id" value={category.id} />
            <input type="hidden" name="restaurant_id" value={restaurant.id} />
            <div className="flex items-center gap-2">
              <input name="name" className="input" defaultValue={category.name} required />
              <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" defaultChecked={category.active} /> Active</label>
              <button className="btn-secondary">Save</button>
            </div>
          </form>
        ))}
      </div>
    </div>
  );
}
