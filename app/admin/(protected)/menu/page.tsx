import { createServerClient } from '@/lib/supabase/server';
import { MenuItemForm } from '@/components/admin/menu-item-form';

export default async function AdminMenuPage() {
  const supabase = createServerClient();

  const [{ data: restaurant }, { data: categories }, { data: menuItems }] = await Promise.all([
    supabase.from('restaurants').select('id').eq('slug', 'beirut-express').single(),
    supabase.from('categories').select('id,name').order('name'),
    supabase
      .from('menu_items')
      .select('id,name,description,price,category_id,image_url,active,featured,bestseller')
      .order('created_at', { ascending: false }),
  ]);

  if (!restaurant) return <p className="text-muted">Restaurant not found.</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="section-title">Menu Management</h1>
        <p className="mt-1 text-sm text-muted">Maintain menu items with consistent media, pricing, and visibility controls.</p>
      </div>

      <MenuItemForm categories={categories ?? []} restaurantId={restaurant.id} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Existing Items</h2>
        {(menuItems ?? []).map((item) => (
          <MenuItemForm
            key={item.id}
            categories={categories ?? []}
            restaurantId={restaurant.id}
            item={{
              ...item,
              price: Number(item.price),
            }}
          />
        ))}
      </section>
    </div>
  );
}
