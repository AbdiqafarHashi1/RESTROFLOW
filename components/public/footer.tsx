import Link from 'next/link';
import { Restaurant } from '@/types';

export function SiteFooter({ restaurant }: { restaurant: Restaurant }) {
  return (
    <footer className="mt-16 border-t border-border bg-surface">
      <div className="container-padding mx-auto grid max-w-6xl gap-8 py-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="font-heading text-2xl">{restaurant.name}</p>
          <p className="mt-3 max-w-md text-sm text-muted">{restaurant.description}</p>
          <p className="mt-3 text-sm text-muted">Location: {restaurant.address || '-'}</p>
          <p className="text-sm text-muted">Service Area: {restaurant.service_area || '-'}</p>
          <p className="text-sm text-muted">Delivery Fee: {restaurant.delivery_fee ?? 0} {restaurant.currency}</p>
        </div>
        <div>
          <p className="font-medium">Quick Links</p>
          <div className="mt-3 flex flex-col gap-2 text-sm text-muted">
            <Link href="/">Home</Link>
            <a href="#menu-section">Order Menu</a>
            <Link href="/checkout">Checkout</Link>
          </div>
        </div>
        <div>
          <p className="font-medium">Contact</p>
          <div className="mt-3 space-y-2 text-sm text-muted">
            <p>Phone: {restaurant.phone || '-'}</p>
            <p>WhatsApp: {restaurant.whatsapp_number || '-'}</p>
            <p>Hours: {restaurant.opening_hours || '-'}</p>
            <p>Status: {restaurant.is_open ? 'Open' : 'Closed'}</p>
            <p>Payment Number: {restaurant.payment_number || '-'}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted">
        <p>© {new Date().getFullYear()} {restaurant.name}. All rights reserved.</p>
        <Link href="/admin/login" className="mt-1 inline-block text-[11px] text-muted/70 hover:text-muted">Admin access</Link>
      </div>
    </footer>
  );
}
