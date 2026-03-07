'use client';

import { useEffect, useState } from 'react';
import { CartItem, MenuItem } from '@/types';

const KEY = 'beirut-cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setItems(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  function addItem(item: MenuItem) {
    setItems((prev) => {
      const existing = prev.find((x) => x.menu_item_id === item.id);
      if (existing) return prev.map((x) => x.menu_item_id === item.id ? { ...x, quantity: x.quantity + 1 } : x);
      return [...prev, { menu_item_id: item.id, item_name: item.name, unit_price: item.price, quantity: 1 }];
    });
  }

  function updateQty(id: string, quantity: number) {
    setItems((prev) => prev.map((x) => x.menu_item_id === id ? { ...x, quantity } : x).filter((x) => x.quantity > 0));
  }

  function clear() {
    setItems([]);
  }

  return { items, addItem, updateQty, clear };
}
