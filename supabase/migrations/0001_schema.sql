create extension if not exists "pgcrypto";

create table if not exists restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  logo_url text,
  hero_image_url text,
  phone text,
  whatsapp_number text,
  address text,
  service_area text,
  currency text default 'KES',
  delivery_fee numeric default 0,
  opening_hours text,
  is_open boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order int default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id) on delete cascade,
  category_id uuid references categories(id),
  name text not null,
  slug text not null,
  description text,
  price numeric not null,
  image_url text,
  active boolean default true,
  featured boolean default false,
  bestseller boolean default false,
  spicy boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id),
  order_number text unique not null,
  customer_name text not null,
  customer_phone text not null,
  order_type text check (order_type in ('delivery','pickup')),
  area text,
  address text,
  notes text,
  payment_method text check (payment_method in ('cash_on_delivery','pay_on_pickup')),
  subtotal numeric not null,
  delivery_fee numeric not null default 0,
  total numeric not null,
  status text check (status in ('new','confirmed','preparing','out_for_delivery','delivered','cancelled')) default 'new',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  item_name text not null,
  quantity int not null,
  unit_price numeric not null,
  total_price numeric not null,
  created_at timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants(id),
  name text not null,
  phone text not null,
  last_order_at timestamptz,
  total_orders int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (restaurant_id, phone)
);

create table if not exists admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  restaurant_id uuid references restaurants(id),
  full_name text,
  role text default 'admin',
  created_at timestamptz default now()
);

create or replace function upsert_customer_from_order(p_restaurant_id uuid, p_name text, p_phone text)
returns void language plpgsql security definer as $$
begin
  insert into customers (restaurant_id, name, phone, total_orders, last_order_at)
  values (p_restaurant_id, p_name, p_phone, 1, now())
  on conflict (restaurant_id, phone)
  do update set
    name = excluded.name,
    total_orders = customers.total_orders + 1,
    last_order_at = now(),
    updated_at = now();
end;
$$;

alter table restaurants enable row level security;
alter table categories enable row level security;
alter table menu_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table customers enable row level security;
alter table admin_profiles enable row level security;

create policy "public read active categories" on categories for select using (active = true);
create policy "public read active menu items" on menu_items for select using (active = true);
create policy "public read restaurant" on restaurants for select using (true);

create policy "admin all restaurant tables" on restaurants for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all categories" on categories for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all menu_items" on menu_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all orders" on orders for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all order_items" on order_items for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin all customers" on customers for all using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin profile self" on admin_profiles for all using (auth.uid() = id) with check (auth.uid() = id);
