create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  image_url text,
  active boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists promotions_single_active_idx
  on promotions (active)
  where active = true;
