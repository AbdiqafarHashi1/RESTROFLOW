export type OrderType = 'delivery' | 'pickup';
export type PaymentMethod = 'cash_on_delivery' | 'pay_on_pickup';
export type OrderStatus = 'new' | 'confirmed' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  hero_image_url?: string;
  phone?: string;
  whatsapp_number?: string;
  address?: string;
  service_area?: string;
  currency: string;
  delivery_fee: number;
  opening_hours?: string;
  is_open: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
  active: boolean;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image_url?: string;
  active: boolean;
  featured: boolean;
  bestseller: boolean;
  spicy: boolean;
}

export interface CartItem {
  menu_item_id: string;
  item_name: string;
  unit_price: number;
  quantity: number;
}
