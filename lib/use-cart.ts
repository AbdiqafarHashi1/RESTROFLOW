'use client';

import { useSyncExternalStore } from 'react';
import { createBrowserClient } from '@/lib/supabase/client';
import { CartItem, MenuItem } from '@/types';

const GUEST_KEY = 'beirut-cart';
let store: CartItem[] = [];
let initialized = false;
let isLoading = false;
let currentUserId: string | null = null;
let currentProfileId: string | null = null;
let currentCartId: string | null = null;
let authSubscribed = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function saveGuest(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {
    // ignore storage errors (private mode/quota)
  }
}

function readGuest(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setStore(next: CartItem[]) {
  store = next;
  if (!currentUserId) {
    saveGuest(next);
  }
  emit();
}

async function ensureProfileAndCart(userId: string) {
  const supabase = createBrowserClient();

  const { data: existingProfile, error: profileLookupError } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_user_id', userId)
    .maybeSingle();

  if (profileLookupError) {
    currentProfileId = null;
    currentCartId = null;
    return;
  }

  if (!existingProfile) {
    const { data: authUser } = await supabase.auth.getUser();
    const user = authUser.user;
    const phone = user?.phone ?? null;
    const email = user?.email ?? null;
    const fullName = (user?.user_metadata?.full_name as string | undefined) ?? null;

    const { data: insertedProfile, error } = await supabase
      .from('profiles')
      .insert({ auth_user_id: userId, phone, email, full_name: fullName })
      .select('*')
      .single();

    if (error || !insertedProfile) {
      currentProfileId = null;
      currentCartId = null;
      return;
    }
    currentProfileId = insertedProfile.id;
  } else {
    currentProfileId = existingProfile.id;
    await supabase
      .from('profiles')
      .update({
        phone: existingProfile.phone ?? null,
        email: existingProfile.email ?? null,
      })
      .eq('id', existingProfile.id);
  }

  if (!currentProfileId) {
    currentCartId = null;
    return;
  }

  const { data: cart, error: cartLookupError } = await supabase
    .from('carts')
    .select('id')
    .eq('profile_id', currentProfileId)
    .eq('status', 'active')
    .maybeSingle();

  if (cartLookupError) {
    currentCartId = null;
    return;
  }

  if (!cart) {
    const { data: createdCart, error } = await supabase
      .from('carts')
      .insert({ profile_id: currentProfileId, status: 'active' })
      .select('id')
      .single();

    if (error || !createdCart) {
      currentCartId = null;
      return;
    }
    currentCartId = createdCart.id;
  } else {
    currentCartId = cart.id;
  }
}

async function loadRemoteItems() {
  if (!currentCartId) return;
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('cart_items')
    .select('menu_item_id, quantity, unit_price_snapshot, title_snapshot, notes, menu_items(image_url)')
    .eq('cart_id', currentCartId)
    .order('created_at', { ascending: true });

  if (error) {
    return;
  }

  store = (data ?? []).map((row: any) => ({
    menu_item_id: row.menu_item_id,
    quantity: row.quantity,
    unit_price: Number(row.unit_price_snapshot ?? 0),
    item_name: row.title_snapshot,
    notes: row.notes,
    image_url: row.menu_items?.image_url ?? undefined,
  }));
  emit();
}

async function mergeGuestCartIntoRemote() {
  const guestItems = readGuest();
  if (!guestItems.length || !currentCartId) return;
  const supabase = createBrowserClient();

  for (const guestItem of guestItems) {
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', currentCartId)
      .eq('menu_item_id', guestItem.menu_item_id)
      .is('notes', null)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + guestItem.quantity })
        .eq('id', existing.id);
    } else {
      await supabase.from('cart_items').insert({
        cart_id: currentCartId,
        menu_item_id: guestItem.menu_item_id,
        quantity: guestItem.quantity,
        unit_price_snapshot: guestItem.unit_price,
        title_snapshot: guestItem.item_name,
        notes: null,
      });
    }
  }

  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(GUEST_KEY);
    } catch {
      // ignore storage errors
    }
  }
}

async function bootstrapForAuth() {
  try {
    const supabase = createBrowserClient();
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      currentUserId = null;
      currentProfileId = null;
      currentCartId = null;
      setStore(readGuest());
      return;
    }

    const user = data.user;

    if (!user) {
      currentUserId = null;
      currentProfileId = null;
      currentCartId = null;
      setStore(readGuest());
      return;
    }

    currentUserId = user.id;
    await ensureProfileAndCart(user.id);

    if (!currentCartId) {
      setStore(readGuest());
      return;
    }

    await mergeGuestCartIntoRemote();
    await loadRemoteItems();
  } catch {
    currentUserId = null;
    currentProfileId = null;
    currentCartId = null;
    setStore(readGuest());
  }
}

function ensureInitialized() {
  if (initialized) return;
  initialized = true;
  store = readGuest();

  if (typeof window === 'undefined') return;

  isLoading = true;
  emit();
  bootstrapForAuth().finally(() => {
    isLoading = false;
    emit();
  });

  if (!authSubscribed) {
    authSubscribed = true;
    const supabase = createBrowserClient();
    supabase.auth.onAuthStateChange(() => {
      isLoading = true;
      emit();
      bootstrapForAuth().finally(() => {
        isLoading = false;
        emit();
      });
    });
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  const onStorage = (event: StorageEvent) => {
    if (event.key !== GUEST_KEY) return;
    if (currentUserId) return;
    store = readGuest();
    emit();
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
  return { items: store, isLoading, isAuthenticated: Boolean(currentUserId) };
}

async function syncItem(menuItemId: string, quantity: number, fallback?: Partial<CartItem>) {
  if (!currentCartId) return;
  const supabase = createBrowserClient();
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id')
    .eq('cart_id', currentCartId)
    .eq('menu_item_id', menuItemId)
    .is('notes', null)
    .maybeSingle();

  if (quantity <= 0) {
    if (existing) await supabase.from('cart_items').delete().eq('id', existing.id);
    return;
  }

  if (existing) {
    await supabase.from('cart_items').update({ quantity }).eq('id', existing.id);
    return;
  }

  await supabase.from('cart_items').insert({
    cart_id: currentCartId,
    menu_item_id: menuItemId,
    quantity,
    unit_price_snapshot: fallback?.unit_price ?? 0,
    title_snapshot: fallback?.item_name ?? 'Menu item',
    notes: null,
  });
}

export function useCart() {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, () => ({ items: [], isLoading: false, isAuthenticated: false }));

  async function addItem(item: MenuItem) {
    const existing = store.find((x) => x.menu_item_id === item.id);
    const next = existing
      ? store.map((x) => x.menu_item_id === item.id ? { ...x, quantity: x.quantity + 1 } : x)
      : [...store, { menu_item_id: item.id, item_name: item.name, unit_price: item.price, quantity: 1, image_url: item.image_url }];

    setStore(next);

    if (currentUserId) {
      await syncItem(item.id, (existing?.quantity ?? 0) + 1, {
        item_name: item.name,
        unit_price: item.price,
      });
      await loadRemoteItems();
    }
  }

  async function updateQty(id: string, quantity: number) {
    const next = store
      .map((x) => x.menu_item_id === id ? { ...x, quantity } : x)
      .filter((x) => x.quantity > 0);
    setStore(next);

    if (currentUserId) {
      const fallback = store.find((x) => x.menu_item_id === id);
      await syncItem(id, quantity, fallback);
      await loadRemoteItems();
    }
  }

  async function removeItem(id: string) {
    await updateQty(id, 0);
  }

  async function clear() {
    setStore([]);

    if (currentUserId && currentCartId) {
      const supabase = createBrowserClient();
      await supabase.from('cart_items').delete().eq('cart_id', currentCartId);
    }
  }

  return { ...snapshot, addItem, updateQty, removeItem, clear };
}
