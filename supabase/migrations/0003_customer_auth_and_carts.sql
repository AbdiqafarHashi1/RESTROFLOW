create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  phone text,
  email text,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete set null,
  status text not null default 'active' check (status in ('active', 'completed', 'abandoned')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  menu_item_id uuid references menu_items(id),
  quantity int not null check (quantity > 0),
  unit_price_snapshot numeric not null,
  title_snapshot text not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, menu_item_id, notes)
);

create or replace function set_row_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on profiles;
create trigger set_profiles_updated_at
before update on profiles
for each row
execute function set_row_updated_at();

drop trigger if exists set_carts_updated_at on carts;
create trigger set_carts_updated_at
before update on carts
for each row
execute function set_row_updated_at();

drop trigger if exists set_cart_items_updated_at on cart_items;
create trigger set_cart_items_updated_at
before update on cart_items
for each row
execute function set_row_updated_at();

alter table profiles enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;

create policy "profile self read" on profiles
for select using (auth.uid() = auth_user_id);

create policy "profile self insert" on profiles
for insert with check (auth.uid() = auth_user_id);

create policy "profile self update" on profiles
for update using (auth.uid() = auth_user_id) with check (auth.uid() = auth_user_id);

create policy "profile self delete" on profiles
for delete using (auth.uid() = auth_user_id);

create policy "cart own access" on carts
for all
using (
  profile_id in (select id from profiles where auth_user_id = auth.uid())
)
with check (
  profile_id in (select id from profiles where auth_user_id = auth.uid())
);

create policy "cart item own access" on cart_items
for all
using (
  cart_id in (
    select c.id
    from carts c
    join profiles p on p.id = c.profile_id
    where p.auth_user_id = auth.uid()
  )
)
with check (
  cart_id in (
    select c.id
    from carts c
    join profiles p on p.id = c.profile_id
    where p.auth_user_id = auth.uid()
  )
);
