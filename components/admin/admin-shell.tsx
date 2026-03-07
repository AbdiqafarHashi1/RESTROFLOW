'use client';

import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const links = [
  ['Dashboard', '/admin'],
  ['Orders', '/admin/orders'],
  ['Menu', '/admin/menu'],
  ['Categories', '/admin/categories'],
  ['Customers', '/admin/customers'],
  ['Settings', '/admin/settings'],
] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <div
        className={`fixed inset-0 z-30 bg-black/45 transition-opacity md:hidden ${mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={() => setMobileMenuOpen(false)}
      />

      <aside className={`fixed inset-y-0 left-0 z-40 w-[230px] border-r border-border bg-surface p-4 transition-transform md:static md:w-auto md:translate-x-0 md:border-b-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-start justify-between md:block">
          <div>
            <p className="font-heading text-xl">Beirut Admin</p>
            <p className="mt-1 text-xs text-muted">Operations Control Center</p>
          </div>
          <button
            type="button"
            className="rounded-md p-1 text-muted hover:bg-card hover:text-white md:hidden"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-1">
          {links.map(([label, href]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`rounded-lg px-3 py-2 text-sm transition ${active ? 'bg-primary text-black' : 'text-muted hover:bg-card hover:text-white'}`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="container-padding py-6">
        <div className="mb-4 flex items-center justify-between md:hidden">
          <button
            type="button"
            className="rounded-md border border-border bg-surface p-2 text-muted hover:text-white"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <p className="font-heading text-lg">Beirut Admin</p>
          <span className="w-9" />
        </div>
        {children}
      </main>
    </div>
  );
}
