'use client';

import { useSyncExternalStore } from 'react';
import { CartItem, MenuItem } from '@/types';

const KEY = 'beirut-cart';
let store: CartItem[] = [];
let initialized = false;
const listeners = new Set<() => void>();

function readFromStorage() {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(KEY);
    store = raw ? JSON.parse(raw) : [];
  } catch {
    store = [];
  }
}

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  readFromStorage();
}

function persistAndEmit(next: CartItem[]) {
  store = next;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(KEY, JSON.stringify(store));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== KEY) return;
    readFromStorage();
    listeners.forEach((l) => l());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('storage', onStorage);
  }

  return () => {
    listeners.delete(listener);
    if (typeof window !== 'undefined') {
      window.removeEventListener('storage', onStorage);
    }
  };
}

function getSnapshot() {
  ensureInitialized();
  return store;
}

export function useCart() {
  const items = useSyncExternalStore(subscribe, getSnapshot, () => []);

  function addItem(item: MenuItem) {
    const existing = store.find((x) => x.menu_item_id === item.id);
    if (existing) {
      persistAndEmit(store.map((x) => x.menu_item_id === item.id ? { ...x, quantity: x.quantity + 1 } : x));
      return;
    }
    persistAndEmit([...store, { menu_item_id: item.id, item_name: item.name, unit_price: item.price, quantity: 1 }]);
  }

  function updateQty(id: string, quantity: number) {
    persistAndEmit(store.map((x) => x.menu_item_id === id ? { ...x, quantity } : x).filter((x) => x.quantity > 0));
  }

  function clear() {
    persistAndEmit([]);
  }

  return { items, addItem, updateQty, clear };
}
