'use client';

import Link from 'next/link';
import { ShoppingBag, User } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCart } from '@/lib/use-cart';
import { useAuthProfile } from '@/lib/use-auth-profile';
import { readActiveOrderRef } from '@/lib/customer-orders';

export function Navbar({ restaurantName = 'Beirut Express' }: { restaurantName?: string }) {
  const { items } = useCart();
  const { isAuthenticated } = useAuthProfile();
  const router = useRouter();
  const pathname = usePathname();
  const [activeOrderNumber, setActiveOrderNumber] = useState('');
  const safeItems = Array.isArray(items) ? items : [];
  const cartCount = safeItems.reduce((sum, item) => sum + (item?.quantity ?? 0), 0);

  useEffect(() => {
    const ref = readActiveOrderRef();
    setActiveOrderNumber(ref?.orderNumber ?? '');
  }, [pathname]);

  function handleOrderNow() {
    if (safeItems.length > 0) {
      router.push('/checkout');
      return;
    }

    if (pathname === '/') {
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    router.push('/menu');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl container-padding py-3 md:py-4">
        <div className="md:hidden">
          <div className="flex items-center justify-between gap-3">
            <Link href="/" className="font-heading text-xl tracking-wide">{restaurantName}</Link>
            <button type="button" onClick={handleOrderNow} className="btn-primary py-2 text-sm">Order Now</button>
          </div>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {activeOrderNumber ? (
              <Link href={`/order/${activeOrderNumber}`} className="rounded-xl border border-border px-2 py-2 text-center text-xs text-primary">
                View Order Status
              </Link>
            ) : (
              <span className="rounded-xl border border-border px-2 py-2 text-center text-xs text-muted">View Order Status</span>
            )}
            <Link href="/cart" className="relative rounded-xl border border-border px-2 py-2 text-center text-xs text-muted hover:text-white" aria-label="Cart">
              Cart
              {cartCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-black">{cartCount}</span>}
            </Link>
            <Link href={isAuthenticated ? '/account' : '/login'} className="rounded-xl border border-border px-2 py-2 text-center text-xs text-muted hover:text-white" aria-label="Account">
              {isAuthenticated ? 'Profile' : 'Login'}
            </Link>
          </div>
        </div>

        <div className="hidden items-center justify-between md:flex">
          <Link href="/" className="font-heading text-xl tracking-wide">{restaurantName}</Link>
          <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
            <a href="#bestsellers" className="hover:text-white">Best Sellers</a>
            <a href="#menu-section" className="hover:text-white">Menu</a>
            <a href="#delivery-info" className="hover:text-white">Delivery</a>
            <a href="#how-it-works" className="hover:text-white">How it Works</a>
          </nav>
          <div className="flex items-center gap-2">
            {activeOrderNumber ? <Link href={`/order/${activeOrderNumber}`} className="rounded-xl border border-border px-3 py-2 text-xs text-primary">View Order Status</Link> : null}
            <Link href="/cart" className="relative rounded-xl border border-border p-2 text-muted hover:text-white" aria-label="Cart">
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-semibold text-black">{cartCount}</span>}
            </Link>
            <Link href={isAuthenticated ? '/account' : '/login'} className="rounded-xl border border-border p-2 text-muted hover:text-white" aria-label="Account">
              <User size={18} />
            </Link>
            <button type="button" onClick={handleOrderNow} className="btn-primary py-2 text-sm">Order Now</button>
          </div>
        </div>
      </div>
    </header>
  );
}
