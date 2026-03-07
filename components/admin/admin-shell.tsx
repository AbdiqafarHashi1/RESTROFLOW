'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

  return (
    <div className="min-h-screen md:grid md:grid-cols-[230px_1fr]">
      <aside className="border-b border-border bg-surface p-4 md:border-b-0 md:border-r">
        <p className="font-heading text-xl">Beirut Admin</p>
        <p className="mt-1 text-xs text-muted">Operations Control Center</p>
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
      <main className="container-padding py-6">{children}</main>
    </div>
  );
}
