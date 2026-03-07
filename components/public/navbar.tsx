import Link from 'next/link';
import { MessageCircle } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between container-padding py-4">
        <Link href="/" className="font-heading text-xl tracking-wide">Beirut Express</Link>
        <nav className="hidden items-center gap-5 text-sm text-muted md:flex">
          <a href="#bestsellers" className="hover:text-white">Best Sellers</a>
          <a href="#menu-section" className="hover:text-white">Menu</a>
          <a href="#delivery-info" className="hover:text-white">Delivery</a>
          <a href="#how-it-works" className="hover:text-white">How it Works</a>
        </nav>
        <div className="flex items-center gap-2">
          <a href="#menu-section" className="btn-primary py-2 text-sm">Order Now</a>
          <a href="https://wa.me/254700000001" className="btn-secondary hidden py-2 text-sm sm:inline-flex"><MessageCircle className="mr-2 h-4 w-4" />WhatsApp</a>
        </div>
      </div>
    </header>
  );
}
