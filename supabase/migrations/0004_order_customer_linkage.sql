alter table orders add column if not exists profile_id uuid references profiles(id) on delete set null;
alter table orders add column if not exists customer_email text;

create index if not exists orders_profile_id_idx on orders(profile_id);
create index if not exists orders_customer_phone_idx on orders(customer_phone);
create index if not exists orders_order_number_idx on orders(order_number);
