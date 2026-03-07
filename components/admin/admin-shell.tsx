import Link from 'next/link';

const links = [
  ['Dashboard', '/admin'],
  ['Orders', '/admin/orders'],
  ['Menu', '/admin/menu'],
  ['Categories', '/admin/categories'],
  ['Customers', '/admin/customers'],
  ['Settings', '/admin/settings'],
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen md:grid md:grid-cols-[220px_1fr]">
      <aside className="border-b border-border bg-surface p-4 md:border-r md:border-b-0">
        <p className="font-heading text-xl">Beirut Admin</p>
        <nav className="mt-4 flex flex-wrap gap-2 md:flex-col">
          {links.map(([label, href]) => (
            <Link key={href} href={href} className="rounded-lg px-3 py-2 text-sm text-muted hover:bg-card hover:text-white">{label}</Link>
          ))}
        </nav>
      </aside>
      <main className="container-padding py-6">{children}</main>
    </div>
  );
}
