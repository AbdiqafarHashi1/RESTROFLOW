alter table restaurants add column if not exists payment_number text;
alter table restaurants add column if not exists hero_title text;
alter table restaurants add column if not exists hero_subtitle text;

alter table orders drop constraint if exists orders_payment_method_check;
alter table orders add constraint orders_payment_method_check check (payment_method in ('cash_on_delivery','pay_on_pickup','send_money'));

alter table orders add column if not exists payment_status text;
update orders
set payment_status = case
  when payment_method = 'send_money' then 'pending'
  else 'not_required'
end
where payment_status is null;
alter table orders alter column payment_status set default 'not_required';
alter table orders alter column payment_status set not null;
alter table orders drop constraint if exists orders_payment_status_check;
alter table orders add constraint orders_payment_status_check check (payment_status in ('not_required','pending','confirmed','failed'));

alter table orders rename column status to order_status;
alter table orders alter column order_status set default 'new';
alter table orders drop constraint if exists orders_status_check;
alter table orders drop constraint if exists orders_order_status_check;
alter table orders add constraint orders_order_status_check check (order_status in ('new','confirmed','preparing','out_for_delivery','delivered','cancelled'));

alter table orders add column if not exists customer_marked_paid boolean default false;
alter table orders add column if not exists customer_marked_paid_at timestamptz;
