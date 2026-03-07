import Link from 'next/link';
import { Restaurant } from '@/types';

export function SiteFooter({ restaurant }: { restaurant: Restaurant }) {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container-padding mx-auto grid max-w-6xl gap-8 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-heading text-2xl">Beirut Restaurant</p>
          <p className="mt-3 max-w-md text-sm text-muted">Premium Indo-Arab fast casual favourites for delivery and pickup. Built for speed, flavour, and reliable service across Nairobi.</p>
          <p className="mt-3 text-sm text-muted">Location: BBS Mall, Nairobi</p>
          <p className="text-sm text-muted">Pay on Delivery / Pickup available</p>
        </div>
        <div>
          <p className="font-medium">Quick Links</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <Link href="/">Home</Link>
            <a href="#menu-section">Order Menu</a>
            <Link href="/checkout">Checkout</Link>
            <Link href="/admin/login">Admin</Link>
          </div>
        </div>
        <div>
          <p className="font-medium">Contact</p>
          <div className="mt-3 space-y-2 text-sm text-muted">
            <p>Phone: {restaurant.phone}</p>
            <p>WhatsApp: {restaurant.whatsapp_number}</p>
            <p>Hours: {restaurant.opening_hours}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} Beirut Express. All rights reserved.
      </div>
    </footer>
  );
}
