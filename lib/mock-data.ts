import { Category, MenuItem, Restaurant } from '@/types';

export const mockRestaurant: Restaurant = {
  id: '11111111-1111-1111-1111-111111111111',
  name: 'Beirut Restaurant',
  slug: 'beirut-express',
  description: 'Fresh Indo-Arab fast casual favourites delivered quick across Nairobi.',
  phone: '+254700000001',
  whatsapp_number: '254700000001',
  address: 'BBS Mall, Nairobi',
  service_area: 'Nairobi CBD, South B, South C, Kilimani, Ngara',
  currency: 'KES',
  delivery_fee: 150,
  opening_hours: 'Mon-Sun · 10:00 AM - 11:00 PM',
  is_open: true,
  hero_image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop'
};

export const mockCategories: Category[] = [
  { id: 'c1', name: 'Kebab Wraps', slug: 'kebab-wraps', sort_order: 1, active: true },
  { id: 'c2', name: 'Shawarma', slug: 'shawarma', sort_order: 2, active: true },
  { id: 'c3', name: 'Pizza Slices', slug: 'pizza-slices', sort_order: 3, active: true },
  { id: 'c4', name: 'Sides', slug: 'sides', sort_order: 4, active: true },
  { id: 'c5', name: 'Drinks', slug: 'drinks', sort_order: 5, active: true },
  { id: 'c6', name: 'Combos', slug: 'combos', sort_order: 6, active: true }
];

export const mockMenuItems: MenuItem[] = [
  { id: 'm1', category_id: 'c1', name: 'Beirut Kebab Wrap', slug: 'beirut-kebab-wrap', description: 'Chargrilled kebab, fries, salad and garlic sauce wrapped fresh', price: 350, active: true, featured: true, bestseller: true, spicy: false, image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=900&auto=format&fit=crop' },
  { id: 'm2', category_id: 'c2', name: 'Chicken Shawarma Wrap', slug: 'chicken-shawarma-wrap', description: 'Marinated chicken, pickles, fries and garlic sauce', price: 300, active: true, featured: true, bestseller: true, spicy: false, image_url: 'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=900&auto=format&fit=crop' },
  { id: 'm3', category_id: 'c3', name: 'Pepperoni Pizza Slice', slug: 'pepperoni-pizza-slice', description: 'Hot slice with rich cheese and pepperoni', price: 200, active: true, featured: false, bestseller: false, spicy: false, image_url: 'https://images.unsplash.com/photo-1548365328-9f547fb0953b?q=80&w=900&auto=format&fit=crop' },
  { id: 'm4', category_id: 'c4', name: 'Beef Samosa', slug: 'beef-samosa', description: 'Crispy pastry filled with seasoned beef', price: 80, active: true, featured: false, bestseller: false, spicy: false, image_url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=900&auto=format&fit=crop' },
  { id: 'm5', category_id: 'c5', name: 'Karak Tea', slug: 'karak-tea', description: 'Strong spiced tea served hot', price: 100, active: true, featured: false, bestseller: false, spicy: false, image_url: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=900&auto=format&fit=crop' },
  { id: 'm6', category_id: 'c6', name: 'Combo 1', slug: 'combo-1', description: 'Kebab wrap + samosa + karak tea', price: 500, active: true, featured: true, bestseller: true, spicy: false, image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=900&auto=format&fit=crop' }
];
