insert into restaurants (id, name, slug, description, phone, whatsapp_number, address, service_area, currency, delivery_fee, opening_hours, is_open)
values ('11111111-1111-1111-1111-111111111111', 'Beirut Restaurant', 'beirut-express', 'Premium Indo-Arab fast casual delivery.', '+254700000001', '254700000001', 'BBS Mall, Nairobi', 'Nairobi CBD, South B, South C, Kilimani, Ngara', 'KES', 150, 'Mon-Sun 10:00 AM - 11:00 PM', true)
on conflict (slug) do nothing;

insert into categories (restaurant_id, name, slug, sort_order, active)
values
('11111111-1111-1111-1111-111111111111','Kebab Wraps','kebab-wraps',1,true),
('11111111-1111-1111-1111-111111111111','Shawarma','shawarma',2,true),
('11111111-1111-1111-1111-111111111111','Pizza Slices','pizza-slices',3,true),
('11111111-1111-1111-1111-111111111111','Sides','sides',4,true),
('11111111-1111-1111-1111-111111111111','Drinks','drinks',5,true),
('11111111-1111-1111-1111-111111111111','Combos','combos',6,true)
on conflict do nothing;

insert into menu_items (restaurant_id, category_id, name, slug, description, price, image_url, active, featured, bestseller, spicy, sort_order)
select '11111111-1111-1111-1111-111111111111', c.id, x.name, x.slug, x.description, x.price, x.image_url, true, x.featured, x.bestseller, false, x.sort_order
from (values
('kebab-wraps','Beirut Kebab Wrap','beirut-kebab-wrap','Chargrilled kebab, fries, salad and garlic sauce wrapped fresh',350,'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=900&auto=format&fit=crop',true,true,1),
('shawarma','Chicken Shawarma Wrap','chicken-shawarma-wrap','Marinated chicken, pickles, fries and garlic sauce',300,'https://images.unsplash.com/photo-1529006557810-274b9b2fc783?q=80&w=900&auto=format&fit=crop',true,true,2),
('pizza-slices','Pepperoni Pizza Slice','pepperoni-pizza-slice','Hot slice with rich cheese and pepperoni',200,'https://images.unsplash.com/photo-1548365328-9f547fb0953b?q=80&w=900&auto=format&fit=crop',false,false,3),
('sides','Beef Samosa','beef-samosa','Crispy pastry filled with seasoned beef',80,'https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=900&auto=format&fit=crop',false,false,4),
('drinks','Karak Tea','karak-tea','Strong spiced tea served hot',100,'https://images.unsplash.com/photo-1544787219-7f47ccb76574?q=80&w=900&auto=format&fit=crop',false,false,5),
('combos','Combo 1','combo-1','Kebab wrap + samosa + karak tea',500,'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=900&auto=format&fit=crop',true,true,6)
) as x(category_slug,name,slug,description,price,image_url,featured,bestseller,sort_order)
join categories c on c.slug = x.category_slug and c.restaurant_id = '11111111-1111-1111-1111-111111111111'
on conflict do nothing;
